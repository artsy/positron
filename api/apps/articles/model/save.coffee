_ = require 'underscore'
_s = require 'underscore.string'
db = require '../../../lib/db'
search = require '../../../lib/elasticsearch'
stopWords = require '../../../lib/stopwords'
User = require '../../users/model'
async = require 'async'
Joi = require 'joi'
Joi.objectId = require('joi-objectid') Joi
moment = require 'moment'
xss = require 'xss'
cheerio = require 'cheerio'
url = require 'url'
Q = require 'bluebird-q'
request = require 'superagent'
requestBluebird = require 'superagent-bluebird-promise'
Backbone = require 'backbone'
{ Image } = require 'artsy-backbone-mixins'
debug = require('debug') 'api'
schema = require './schema'
Article = require './index'
{ ObjectId } = require 'mongojs'
cloneDeep = require 'lodash.clonedeep'
{ ARTSY_URL, SAILTHRU_KEY, SAILTHRU_SECRET,
FORCE_URL, ARTSY_EDITORIAL_ID, SECURE_IMAGES_URL, GEMINI_CLOUDFRONT_URL, EDITORIAL_CHANNEL, FB_PAGE_ID, INSTANT_ARTICLE_ACCESS_TOKEN } = process.env
sailthru = require('sailthru-client').createSailthruClient(SAILTHRU_KEY,SAILTHRU_SECRET)
artsyXapp = require('artsy-xapp').token or ''

@validate = (input, callback) ->
  whitelisted = _.pick input, _.keys schema.inputSchema
  # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
  whitelisted.author_id = whitelisted.author_id?.toString()
  Joi.validate whitelisted, schema.inputSchema, callback

@onPublish = (article, cb) =>
  unless article.published_at
    article.published_at = new Date
  @generateSlugs article, cb

@onUnpublish = (article, cb) =>
  @generateSlugs article, (err, article) =>
    @deleteArticleFromSailthru _.last(article.slugs), =>
      cb null, article

setOnPublishFields = (article) =>
  article.email_metadata = article.email_metadata or {}
  article.email_metadata.image_url = article.thumbnail_image unless article.email_metadata?.image_url
  if article.contributing_authors?.length > 0
    ca = _.pluck(article.contributing_authors, 'name').join(', ')
  article.email_metadata.author = ca or article.author?.name unless article.email_metadata?.author
  article.email_metadata.headline = article.thumbnail_title unless article.email_metadata?.headline
  article.description = article.description or getDescription(article)
  article

getDescription = (article) =>
  $ = cheerio.load(getTextSections(article))
  text = []
  $('p').map( (i, el) ->
    text.push $(el).text()
  )
  text = text.join(' ').substring(0,150).concat('...')
  text

removeStopWords = (title) ->
  title = title.replace(/[.\/#!$%\^\*;{}=_`’~()]/g,"")
  title = title.replace(/[,&:\—_]/g," ")
  newTitle = _.difference(title.toLocaleLowerCase().split(' '), stopWords.stopWords)
  if newTitle.length > 1 then newTitle.join(' ') else title

@generateSlugs = (article, cb) ->
  stoppedTitle = ''
  if article.thumbnail_title
    stoppedTitle = removeStopWords article.thumbnail_title
  slug = _s.slugify article.author?.name + ' ' + stoppedTitle
  return cb null, article if slug is _.last(article.slugs)
  db.articles.count { slugs: slug }, (err, count) ->
    return cb(err) if err
    slug = slug + '-' + moment(article.published_at).format('MM-DD-YY') if count
    article.slugs = (article.slugs or []).concat slug
    cb(null, article)

@generateKeywords = (input, article, cb) ->
  keywords = []
  callbacks = []
  if (input.primary_featured_artist_ids is not article.primary_featured_artist_ids or
      input.featured_artist_ids is not article.featured_artist_ids or
      input.fair_ids is not article.fair_ids or
      input.partner_ids is not article.partner_ids or
      input.contributing_authors is not article.contributing_authors or
      input.tags is not article.tags)
    return cb(null, article)
  if input.primary_featured_artist_ids
    for artistId in input.primary_featured_artist_ids
      do (artistId) ->
        callbacks.push (callback) ->
          request
            .get("#{ARTSY_URL}/api/v1/artist/#{artistId}")
            .set('X-Xapp-Token': artsyXapp)
            .end callback
  if input.featured_artist_ids
    for artistId in input.featured_artist_ids
      do (artistId) ->
        callbacks.push (callback) ->
          request
            .get("#{ARTSY_URL}/api/v1/artist/#{artistId}")
            .set('X-Xapp-Token': artsyXapp)
            .end callback
  if input.fair_ids
    for fairId in input.fair_ids
      do (fairId) ->
        callbacks.push (callback) ->
          request
            .get("#{ARTSY_URL}/api/v1/fair/#{fairId}")
            .set('X-Xapp-Token': artsyXapp)
            .end callback
  if input.partner_ids
    for partnerId in input.partner_ids
      do (partnerId) ->
        callbacks.push (callback) ->
          request
            .get("#{ARTSY_URL}/api/v1/partner/#{partnerId}")
            .set('X-Xapp-Token': artsyXapp)
            .end callback
  async.parallel callbacks, (err, results) =>
    return cb(err) if err
    keywords = input.tags or []
    keywords = keywords.concat (res.body.name for res in results)
    if input.contributing_authors?.length > 0
      for author in input.contributing_authors
        keywords.push author.name
    article.keywords = keywords[0..9]
    cb(null, article)

@indexForSearch = (article, cb) ->
  if article.sections
    sections = for section in article.sections
      section.body

  search.client.index(
    index: search.index,
    type: 'article',
    id: article.id,
    body:
      slug: article.slug
      name: article.title
      description: article.description
      published: article.published
      published_at: article.published_at
      scheduled_publish_at: article.scheduled_publish_at
      visible_to_public: article.published and sections?.length > 0 and article.channel_id and article.channel_id.toString() is EDITORIAL_CHANNEL
      author: article.author and article.author.name or ''
      featured: article.featured
      tags: article.tags
      body: sections and stripHtmlTags(sections.join(' ')) or ''
      image_url: crop(article.thumbnail_image, { width: 70, height: 70 })
    , (error, response) ->
      console.log('ElasticsearchIndexingError: Article ' + article.id + ' : ' + error) if error
  )

@removeFromSearch = (id) ->
  search.client.delete(
    index: search.index
    type: 'article'
    id: id
  , (error, response) ->
      console.log(error) if error
  )

@sanitizeAndSave = (callback) => (err, article) =>
  return callback err if err
  # Send new content call to Sailthru on any published article save
  if article.published or article.scheduled_publish_at
    article = setOnPublishFields article
    @indexForSearch article
    @distributeArticle article, =>
      db.articles.save sanitize(typecastIds article), callback
  else
    @indexForSearch article
    db.articles.save sanitize(typecastIds article), callback

# TODO: Create a Joi plugin for this https://github.com/hapijs/joi/issues/577
sanitize = (article) ->
  if article.sections
    sections = for section in article.sections
      section.body = sanitizeHtml section.body if section.type is 'text'
      section.caption = sanitizeHtml section.caption if section.type is 'image'
      section.url = sanitizeLink section.url if section.type is 'video'
      if section.type is 'slideshow'
        for item in section.items when item.type is 'image' or item.type is 'video'
          item.caption = sanitizeHtml item.caption if item.type is 'image'
          item.url = sanitizeLink item.url if item.type is 'video'
      if section.type in ['image_collection', 'image_set']
        for item in section.images when item.type is 'image'
          item.caption = sanitizeHtml item.caption
      section
  else
    sections = []
  sanitized = _.extend article,
    title: sanitizeHtml article.title
    thumbnail_title: sanitizeHtml article.thumbnail_title
    lead_paragraph: sanitizeHtml article.lead_paragraph
    sections: sections
  if article.hero_section?.caption
    sanitized.hero_section.caption = sanitizeHtml article.hero_section.caption
  sanitized

sanitizeLink = (urlString) ->
  u = url.parse urlString
  if u.protocol then urlString else 'http://' + u.href

sanitizeHtml = (html) ->
  return xss html unless try $ = cheerio.load html, decodeEntities: false
  $('a').each ->
    if $(this).attr 'href'
      u = sanitizeLink $(this).attr 'href'
      $(this).attr 'href', u
  xss $.html(),
    whiteList: _.extend xss.getDefaultWhiteList(),
      a: ['target', 'href', 'title', 'name', 'class', 'data-id']

typecastIds = (article) ->
  _.extend article,
    # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
    _id: ObjectId(article._id)
    contributing_authors: article.contributing_authors.map( (author)->
      author.id = ObjectId(author.id)
      author
    ) if article.contributing_authors
    author_id: ObjectId(article.author_id) if article.author_id
    fair_ids: article.fair_ids.map(ObjectId) if article.fair_ids
    fair_programming_ids: article.fair_programming_ids.map(ObjectId) if article.fair_programming_ids
    fair_artsy_ids: article.fair_artsy_ids.map(ObjectId) if article.fair_artsy_ids
    fair_about_ids: article.fair_about_ids.map(ObjectId) if article.fair_about_ids
    section_ids: article.section_ids.map(ObjectId) if article.section_ids
    auction_ids: article.auction_ids.map(ObjectId) if article.auction_ids
    partner_ids: article.partner_ids.map(ObjectId) if article.partner_ids
    show_ids: article.show_ids.map(ObjectId) if article.show_ids
    primary_featured_artist_ids: article.primary_featured_artist_ids.map(ObjectId) if article.primary_featured_artist_ids
    featured_artist_ids: article.featured_artist_ids.map(ObjectId) if article.featured_artist_ids
    featured_artwork_ids: article.featured_artwork_ids.map(ObjectId) if article.featured_artwork_ids
    biography_for_artist_id: ObjectId(article.biography_for_artist_id) if article.biography_for_artist_id
    super_article: if article.super_article?.related_articles then _.extend article.super_article, related_articles: article.super_article.related_articles.map(ObjectId) else {}
    channel_id: ObjectId(article.channel_id) if article.channel_id
    partner_channel_id: ObjectId(article.partner_channel_id) if article.partner_channel_id

@distributeArticle = (article, cb) =>
  tags = ['article']
  tags = tags.concat ['magazine'] if article.featured is true
  tags = tags.concat article.keywords
  imageSrc = article.email_metadata?.image_url
  images =
    full: url: crop(imageSrc, { width: 1200, height: 706 } )
    thumb: url: crop(imageSrc, { width: 900, height: 530 } )
  cleanArticlesInSailthru article.slugs
  postFacebookAPI article
  # postSailthruAPI article, tags, images, ->
  #   console.log 'made the api callback'
  cb()

postFacebookAPI = (article) ->
  html = "<html lang=\"en\" prefix=\"op: http://media.facebook.com/op#\">
<head>
<meta charset=\"utf-8\">
<meta property=\"op:markup_version\" content=\"v1.0\">
<link rel=\"canonical\" href=\"https://www.artsy.net/article/artsy-editorial-stands-lose-nea-eliminated\">
<meta property=\"fb:article_style\" content=\"default\">
<meta property=\"fb:admins\" content=\"7961740\">
</head>
<body>
            <article><header><h1>Who Stands to Lose the Most if the NEA Is Eliminated?</h1>
                <h3>&lt;p&gt;&lt;br&gt;&lt;/p&gt;</h3>
                <address>Artsy Editorial</address>
                <address>Isaac Kaplan</address>
                <time datetime=\"2017-01-31T02:26:51.470Z\" class=\"op-published\">Jan 31st, 2017 2:26 am</time><time datetime=\"2017-01-31T02:26:51.469Z\" class=\"op-modified\">Jan 31st, 2017 2:26 am</time></header><figure><img src=\"https://artsy-media-uploads.s3.amazonaws.com/_z9MZRBZgr-zbS692ehC-Q%2Fbrendabaker2.jpg\"><figcaption><h1>With an understanding that farmers and artists have creation in common, Reedsburg, Wisconsin’s Wormfarm formed a vision for farm-based ephemeral art installations and roadside Culture Stands. Photo via arts.gov.</h1>
                        </figcaption></figure><p>Most Americans are less familiar with the National Endowment for the Arts’s mission than with its reputation as a source of controversy and Republican ire. The NEA has long been a target for elimination by Republicans, but they’ve never succeeded in wiping it out altogether. Until, perhaps, now. Pressing fears about the agency’s future arose after a report by <i>The Hill </i><a href=\"http://thehill.com/policy/finance/314991-trump-team-prepares-dramatic-cuts\">revealed</a> that an early Trump budget proposal is based heavily off plans drawn up by the right-leaning Heritage Foundation, which prescribes eliminating funding to the NEA and its sister agency the National Endowment for the Humanities. Several <a href=\"https://www.washingtonpost.com/news/the-fix/wp/2017/01/19/trump-reportedly-wants-to-cut-cultural-programs-that-make-up-0-02-percent-of-federal-spending/?tid=a_inl&amp;utm_term=.f489a9d3d4e8\">pieces</a> <a href=\"http://www.onstageblog.com/columns/2017/1/19/de-funding-the-national-endowment-for-the-arts-is-not-about-saving-money-its-about-censorship\">have</a> come out debunking the idea that cuts are fiscally necessary, given how little the NEA actually receives in government funding—about $147.9 million in fiscal year 2016, or 0.004% of the $3.9 trillion federal budget. Since the original report in <i>The Hill</i>, there hasn’t been much by the way of confirmation.</p>
<p>Regardless of the NEA’s future, it’s worth pausing to examine what it actually does and why it’s significant, beyond its role as one of the few dedicated government patrons of art organizations, education programs, exhibitions, festivals, and more. In response to the potential elimination of the agency, Australian artist Tega Brain <a href=\"http://www.neafunded.us/\">created</a> a running list of the projects it funded last year. On its relatively miniscule budget, the agency has an outsize impact, both through its grants programs as well as an indemnity program that saves museums millions of dollars. It helps arts organizations raise private funds, and its geographical mandate ensures that funds reach beyond the nation’s cultural capitals. Here are three key things to know about the NEA.</p>
<h2>Geographical Distribution</h2>
<p>A crucial aspect of the NEA is that it is a national organization with a mission to “promote equal access to the arts in every community across America,” <a href=\"https://www.arts.gov/about-nea\">according</a> to its website. This means the agency’s impact reaches beyond just cultural capitals or the coasts. Instead, NEA “funds are geographically distributed so that they’re touching counties, states, communities throughout the country,” says Zannie Voss, director of the National Center for Arts Research (NCAR). “There’s no other support source that is able or in a position to provide that kind of national elevation of arts and culture.”</p>
<p>According to the NEA, it awarded over 2,500 grants this past fiscal year, spread across all 435 congressional districts. Smaller organizations, defined as those who spent less than $350,000 the prior year—received 30% of NEA direct grants. Major institutions, those that spent over $1.75 million, got slightly more, at 35% of all direct grants, and mid-sized institutions got the other 35%. So while large institutions in big cities would likely be impacted by cuts, “there’s a lot more funders in New York, in L.A., in Chicago, who can pick up the mantle,” said Meg Leary of United States Artists (USA), an independent private arts nonprofit that provides grants directly to artists—something the NEA hasn’t done, except to writers, since the bruising culture wars of the ’90s. “It’s the rural areas of the country, it’s places that have not that much access to cultural resources already who will be incredibly affected,” she added. Along with more private donors, big cities also have stronger public arts funding as well. For example, New York City’s cultural agency would be the largest public funder of the arts in the entire nation if the NEA were to be eliminated.</p>
<p>The NEA also <a href=\"http://www.smu.edu/~/media/Site/Meadows/NCAR/NCAR%20NEA%20Study\">often</a> awards its funding to “economically diverse communities,” meaning they have a high percentage of households that are wealthy <i>and</i> of those that are below the poverty line. And while absolute NEA grant dollars rise in accordance with population size (bigger cities get more money overall), the actual per capita value of NEA grants increases as population lessens (smaller communities get more NEA dollars per person).</p>
<h2>Straddling the Public / Private Divide</h2>
<p>Often the debate over the NEA implies a clear distinction between public money and private money. The latter is abundant, the former is scarce—so why do we need it at all? In fact, those meager public dollars have a multiplier effect because of how the NEA operates, enabling arts organizations to raise lots more of the same private dollars that groups like the Heritage Foundation argue make the NEA superfluous. So yes, the average American taxpayer gives the NEA less than pennies on the dollar per year while total private arts funding amounted to about $42 dollars per person in 2012. But because the NEA puts grantees through a rigorous vetting process before doling out a funds, recipients are more likely to receive further funding once they’ve secured the NEA imprimatur.</p>
<p>In 2016, the NEA allocated about $71 million for its grant and awards program. So how does an exhibition organizer or an arts nonprofit go about getting an NEA grant? Unsurprisingly, it begins with a grant application. We won’t bore you with too many details, but these applications are reviewed by some 75 panels convened annually and staffed by professionals from a specific discipline (arts education, museums, folk and traditional arts, etc.) along with at least one lay person. The panels’ recommendations are then sent to the National Council on the Arts, which is comprised of artists, scholars, arts patrons—appointed by the president and approved by the Senate—as well as six non-voting members of Congress. After the NCA weighs in, the final recommendations head to the NEA chair, currently Jane Chu, for final review.</p>
<p>So if you get one of the thousands of grants awarded each year, “it’s a statement saying that you’ve made it,” which in turn helps raise more funds privately, said Leary. Often, NEA grants are also conditional on raising matching funds from other sources for the amount of the grant. <a href=\"https://www.arts.gov/sites/default/files/nea-quick-facts.pdf\">According</a> to the agency, every $1 of public money resulted in $9 of private and other public dollars in 2016. The NEA calculates that grants resulted in arts organizations bringing in roughly $500 million in such funds in 2016.</p>
<h2>States, Diversity, and Indemnity</h2>
<p>State arts agencies are also the recipient of federal funding through the NEA, which gives about 40% of its grant and awards budget, around $47 million, to the states (although state-level arts agencies themselves <a href=\"http://latimesblogs.latimes.com/culturemonster/2011/05/kansas-governor-eliminates-states-arts-funding.html\">have been targeted</a> by local Republicans for elimination). State money then sometimes trickles down to local arts authorities as well. Significantly, the NEA runs a National Heritage Fellowship program geared towards <a href=\"https://www.arts.gov/artistic-fields/folk-traditional-arts\">folk and traditional arts and artists</a>, which provides over $4 million annually in grants and awards.</p>
<p>The NEA also administers an important federal indemnity program that allows museums to collectively save $30 million each year by offsetting insurance costs. Created in the 1970s, the program has only paid out two claims, totaling $104,700, while helping museums put on expansive exhibitions they might not be able to afford if they had to pay for private insurance for each and every work. It’s been used by numerous institutions to ease their financial burden this year alone, including by the <a href=\"https://www.artsy.net/philadelphia-museum-of-art\">Philadelphia Museum of Art</a>’s “International Pop” show and the Taft Museum of Art’s “Daubigny, Monet, Van Gogh: Impressions of Landscape” exhibition.</p>
<p>Beyond all of these important measures, the NEA’s elimination would be a deeply symbolic loss. Today there is, in this country, a national arts agency that rewards and fosters the culture and creativity necessary for any healthy democracy. As the <i>Washington Post</i>’s culture critic Philip Kennicott <a href=\"https://www.washingtonpost.com/news/arts-and-entertainment/wp/2017/01/19/cutting-the-nea-is-first-move-to-eliminate-a-free-open-public-realm/?utm_term=.7b7774989486\">argued</a>, what’s at stake is the very notion of a democratic space in which art, ideas, and information are produced beyond the constraints of commerce. The attack on the NEA is part, he writes, “of a nascent but ominous larger movement to eliminate the last vestiges of a public realm free of the dictates of the market.”</p>
<p>—Isaac Kaplan</p>
                      <figure class=\"op-interactive\"><iframe src=\"http://link.artsy.net/join/sign-up-editorial-facebook\" height=\"250\" class=\"no-margin\"></iframe>
                      </figure><figure class=\"op-tracker\"><iframe hidden>
                  <script type=\"text/javascript\">
                    PARSELY = { autotrack: false, onload: function() { PARSELY.beacon.trackPageView({ urlref: 'http://instantarticles.fb.com' }); return true; } }
                    !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error(\"Segment snippet included twice.\");else{analytics.invoked=!0;analytics.methods=[\"trackSubmit\",\"trackClick\",\"trackLink\",\"trackForm\",\"pageview\",\"identify\",\"reset\",\"group\",\"track\",\"ready\",\"alias\",\"page\",\"once\",\"off\",\"on\"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement(\"script\");e.type=\"text/javascript\";e.async=!0;e.src=(\"https:\"===document.location.protocol?\"https://\":\"http://\")+\"cdn.segment.com/analytics.js/v1/\"+t+\"/analytics.min.js\";var n=document.getElementsByTagName(\"script\")[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION=\"3.1.0\";
                    analytics.load(\"gBWvNwRdB26taNdjAAVeP68BPWKBUBxZ\");
                    analytics.page({referrer: 'http://instantarticles.fb.com'});
                    }}();
                    // Track 15 second bounce rate
                    setTimeout(function() {
                      analytics.track('time on page more than 15 seconds', { category: '15 Seconds', message: \"/article/artsy-editorial-stands-lose-nea-eliminated\", context: 'instant-articles' }, { integrations: { 'Mixpanel': false } } );
                    }, 15000);
                    // Track 3 Minute bounce rate
                    setTimeout(function() {
                      analytics.track('time on page more than 3 minutes', { category: '3 Minutes', message: \"/article/artsy-editorial-stands-lose-nea-eliminated\", context: 'instant-articles' }, { integrations: { 'Mixpanel': false } } );
                    }, 180000);
                    var _i = 30;
                    setInterval( function() {
                       analytics.track('time on page',  {context: 'instant-articles', seconds: _i}, { integrations: { 'Mixpanel': false } } );
                       _i += 30;
                    }, 30000);
                  </script></iframe>
              </figure><footer></footer></article>
</body>
</html>"
  requestBluebird
    .post "https://graph.facebook.com/#{FB_PAGE_ID}/instant_articles"
    .send
      access_token: INSTANT_ARTICLE_ACCESS_TOKEN
      development_mode: true
      html_source: html
    .end (err, response) =>
      console.log response

postSailthruAPI = (article, tags, images, cbAPI) ->
  html = if article.send_body then getTextSections(article) else ''
  sailthru.apiPost 'content',
  url: "#{FORCE_URL}/article/#{_.last(article.slugs)}"
  date: article.published_at
  title: article.email_metadata?.headline
  author: article.email_metadata?.author
  tags: tags
  images: images
  spider: 0
  vars:
    credit_line: article.email_metadata?.credit_line
    credit_url: article.email_metadata?.credit_url
    html: html
    custom_text: article.email_metadata?.custom_text
    daily_email: article.daily_email
    weekly_email: article.weekly_email
  , (err, response) =>
    debug err if err
    cbAPI()


cleanArticlesInSailthru = (slugs = []) =>
  if slugs.length > 1
    slugs.forEach (slug, i) =>
      unless i is slugs.length - 1
        @deleteArticleFromSailthru slug, ->

@deleteArticleFromSailthru = (slug, cb) =>
  sailthru.apiDelete 'content',
    url: "#{FORCE_URL}/article/#{slug}"
  , (err, response) =>
    debug err if err
    cb()

stripHtmlTags = (str) ->
  if (str == null)
    return ''
  else
    String(str).replace /<\/?[^>]+>/g, ''

getTextSections = (article) ->
  condensedHTML = article.lead_paragraph or ''
  _.map article.sections, (section) ->
    condensedHTML = condensedHTML.concat section.body if section.type is 'text'
  condensedHTML

crop = (url, options = {}) ->
  { width, height } = options
  "#{GEMINI_CLOUDFRONT_URL}/?resize_to=fill&width=#{width}&height=#{height}&quality=95&src=#{encodeURIComponent(url)}"

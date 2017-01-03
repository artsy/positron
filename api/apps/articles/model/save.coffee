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
FORCE_URL, ARTSY_EDITORIAL_ID, SECURE_IMAGES_URL, GEMINI_CLOUDFRONT_URL, EDITORIAL_CHANNEL } = process.env
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
  title = title.replace(/[.,\/#!$%\^&\*;:{}=\—_`’~()]/g," ")
  newTitle = _.difference(title.split(' '), stopWords.stopWords).join(' ')
  return newTitle

@generateSlugs = (article, cb) ->
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

@generateArtworks = (input, article, cb) ->
  articleOrder = _.pluck(_.where(article.sections, type: 'artworks'), 'ids').join()
  inputOrder = _.pluck(_.where(input.sections, type: 'artworks'), 'ids').join()
  if input.sections?.length > 0
    article.sections = input.sections
  return cb null, article unless input.sections
  emptyArtworks = _.filter input.sections, (section) ->
    section.type is 'artworks' and section.artworks.length is 0
  if emptyArtworks.length is 0 and inputOrder is articleOrder
    return cb(null, article)
  # Try to fetch and denormalize the artworks from Gravity asynchonously
  artworkIds = _.pluck (_.where input.sections, type: 'artworks' ), 'ids'
  Q.allSettled( for artworkId in _.flatten artworkIds
    requestBluebird
      .get("#{ARTSY_URL}/api/v1/artwork/#{artworkId}")
      .set('X-Xapp-Token': artsyXapp)
  ).done (responses) =>
    fetchedArtworks = _.map responses, (res) ->
      res.value?.body
    newSections = []
    for section in cloneDeep input.sections
      if section.type is 'artworks'
        section.artworks = []
        for artworkId in section.ids
          artwork = _.findWhere fetchedArtworks, _id: artworkId
          if artwork
            section.artworks.push denormalizedArtworkData artwork
          else
            section.ids = _.without section.ids, artworkId
        # Section shouldn't be added if there are no artworks
        section = {} if section.artworks.length is 0
      newSections.push section unless _.isEmpty section
    article.sections = newSections
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

denormalizedArtworkData = (artwork) ->
  artwork = new Backbone.Model artwork
  AdditionalImage = Backbone.Model.extend Image(SECURE_IMAGES_URL)
  images = artwork.get('images')
  defaultImage = new AdditionalImage(_.findWhere(images, is_default: true) or _.first images)
  denormalizedArtwork =
    type: 'artwork'
    id: artwork.get('_id')
    slug: artwork.get('id')
    date: artwork.get('date')
    title: artwork.get('title')
    image: defaultImage.bestImageUrl(['larger','large', 'medium', 'small'])
    partner:
      name: getPartnerName artwork
      slug: getPartnerLink artwork
    artist:
      name: getArtistName artwork
      slug: artwork.get('artist')?.id

getArtistName = (artwork) ->
  if artwork.get('artist')?.name
    artwork.get('artist').name
  else if artwork.get('artists')?.length > 0
    _.compact(artwork.get('artists').pluck('name'))[0]
  else
    ''

getPartnerName = (artwork) ->
  if artwork.get('collecting_institution')?.length > 0
    artwork.get('collecting_institution')
  else if artwork.get('partner')
    artwork.get('partner').name
  else
    ''

getPartnerLink = (artwork) ->
  partner = artwork.get('partner')
  return unless partner and partner.type isnt 'Auction'
  if partner.default_profile_public and partner.default_profile_id
    return partner.default_profile_id

@sanitizeAndSave = (callback) => (err, article) =>
  return callback err if err
  # Send new content call to Sailthru on any published article save
  if article.published or article.scheduled_publish_at
    article = setOnPublishFields article
    @indexForSearch article
    @sendArticleToSailthru article, =>
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

@sendArticleToSailthru = (article, cb) =>
  tags = ['article']
  tags = tags.concat ['magazine'] if article.featured is true
  tags = tags.concat article.keywords
  imageSrc = article.email_metadata?.image_url
  images =
    full: url: crop(imageSrc, { width: 1200, height: 706 } )
    thumb: url: crop(imageSrc, { width: 900, height: 530 } )
  html = if article.send_body then getTextSections(article) else ''
  cleanArticlesInSailthru article.slugs
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
    cb()

cleanArticlesInSailthru = (slugs = []) ->
  if slugs.length > 1
    _.map slugs, (slug, i) =>
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

_ = require 'underscore'
_s = require 'underscore.string'
Backbone = require 'backbone'
search = require '../../../lib/elasticsearch'
{ SAILTHRU_KEY, SAILTHRU_SECRET, FORCE_URL, EDITORIAL_CHANNEL,
  FB_PAGE_ID, INSTANT_ARTICLE_ACCESS_TOKEN, GEMINI_CLOUDFRONT_URL,
  NODE_ENV, SEGMENT_WRITE_KEY_MICROGRAVITY } = process.env
sailthru = require('sailthru-client').createSailthruClient(SAILTHRU_KEY,SAILTHRU_SECRET)
async = require 'async'
debug = require('debug') 'api'
request = require 'superagent'
jade = require 'jade'
Article = require '../../../models/article.coffee'
moment = require 'moment'
particle = require 'particle'
cloneDeep = require 'lodash.clonedeep'

@distributeArticle = (article, cb) =>
  cleanArticlesInSailthru article.slugs
  async.parallel [
    (callback) ->
      postFacebookAPI article, callback
    (callback) ->
      postSailthruAPI article, callback
  ], (err, results) ->
    debug err if err
    cb(article)

@deleteArticleFromSailthru = (slug, cb) =>
  sailthru.apiDelete 'content',
    url: "#{FORCE_URL}/article/#{slug}"
  , (err, response) =>
    debug err if err
    cb()

cleanArticlesInSailthru = (slugs = []) =>
  if slugs.length > 1
    slugs.forEach (slug, i) =>
      unless i is slugs.length - 1
        @deleteArticleFromSailthru slug, ->

postFacebookAPI = (article, cb) ->
  article = new Article cloneDeep article
  return cb() unless article.isEditorial()
  article.prepForInstant()
  jade.renderFile 'api/apps/articles/components/instant_articles/index.jade',
    {
      article: article
      forceUrl: FORCE_URL
      segmentWriteKey: SEGMENT_WRITE_KEY_MICROGRAVITY
      toSentence: _s.toSentence
      _: _
      moment: moment
      particle: particle
    },
    (err, html) ->
      request
        .post "https://graph.facebook.com/v2.7/#{FB_PAGE_ID}/instant_articles"
        .send
          access_token: INSTANT_ARTICLE_ACCESS_TOKEN
          development_mode: NODE_ENV isnt 'production'
          published: NODE_ENV is 'production'
          html_source: html
        .end (err, response) =>
          if err
            debug err
            return cb err
          cb response

postSailthruAPI = (article, cb) ->
  tags = ['article']
  tags = tags.concat ['magazine'] if article.featured is true
  tags = tags.concat article.keywords if article.keywords
  tags = tags.concat article.tracking_tags if article.tracking_tags
  tags = tags.concat article.vertical.name if article.vertical
  imageSrc = article.email_metadata?.image_url
  images =
    full: url: crop(imageSrc, { width: 1200, height: 706 } )
    thumb: url: crop(imageSrc, { width: 900, height: 530 } )
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
    if err
      debug err
      return cb err
    cb response

#
# Search
#
@indexForSearch = (article, cb) ->
  if article.sections
    sections = for section in article.sections
      section.body
  tags = article.tags
  tags = tags.concat article.vertical.name if article.vertical
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
      tags: tags
      body: sections and stripHtmlTags(sections.join(' ')) or ''
      image_url: crop(article.thumbnail_image, { width: 70, height: 70 })
      search_boost: new Article(cloneDeep article).searchBoost()
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

stripHtmlTags = (str) ->
  if (str == null)
    return ''
  else
    String(str).replace /<\/?[^>]+>/g, ''

crop = (url, options = {}) ->
  { width, height } = options
  "#{GEMINI_CLOUDFRONT_URL}/?resize_to=fill&width=#{width}&height=#{height}&quality=95&src=#{encodeURIComponent(url)}"

getTextSections = (article) ->
  condensedHTML = article.lead_paragraph or ''
  _.map article.sections, (section) ->
    condensedHTML = condensedHTML.concat section.body if section.type is 'text'
  condensedHTML

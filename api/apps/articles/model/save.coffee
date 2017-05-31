_ = require 'underscore'
_s = require 'underscore.string'
db = require '../../../lib/db'
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
Backbone = require 'backbone'
debug = require('debug') 'api'
schema = require './schema'
Article = require './index'
{ distributeArticle, deleteArticleFromSailthru, indexForSearch } = require './distribute'
{ ObjectId } = require 'mongojs'
{ ARTSY_URL, GEMINI_CLOUDFRONT_URL } = process.env
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
    deleteArticleFromSailthru _.last(article.slugs), =>
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
  $ = cheerio.load(@getTextSections(article))
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

@sanitizeAndSave = (callback) => (err, article) =>
  return callback err if err
  # Send new content call to Sailthru on any published article save
  if article.published or article.scheduled_publish_at
    article = setOnPublishFields article
    indexForSearch article if article.indexable
    distributeArticle article, =>
      db.articles.save sanitize(typecastIds article), callback
  else
    indexForSearch article if article.indexable
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
    title: sanitizeHtml article.title?.replace /\n/g, ''
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
      span: ['style']

typecastIds = (article) ->
  _.extend article,
    # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
    _id: ObjectId(article._id)
    contributing_authors: article.contributing_authors.map( (author)->
      author.id = ObjectId(author.id)
      author
    ) if article.contributing_authors
    vertical: { id: ObjectId(article.vertical.id), name: article.vertical.name } if article.vertical
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

@getTextSections = (article) ->
  condensedHTML = article.lead_paragraph or ''
  _.map article.sections, (section) ->
    condensedHTML = condensedHTML.concat section.body if section.type is 'text'
  condensedHTML

_ = require 'underscore'
_s = require 'underscore.string'
db = require '../../../lib/db'
User = require '../../users/model'
async = require 'async'
Joi = require 'joi'
Joi.objectId = require('joi-objectid') Joi
moment = require 'moment'
xss = require 'xss'
cheerio = require 'cheerio'
url = require 'url'
request = require 'superagent'
debug = require('debug') 'api'
schema = require './schema'
Article = require './index'
{ ObjectId } = require 'mongojs'
{ ARTSY_URL, SAILTHRU_KEY, SAILTHRU_SECRET, EMBEDLY_KEY, FORCE_URL, ARTSY_EDITORIAL_ID } = process.env
sailthru = require('sailthru-client').createSailthruClient(SAILTHRU_KEY,SAILTHRU_SECRET)
{ crop } = require('embedly-view-helpers')(EMBEDLY_KEY)

@validate = (input, callback) ->
  whitelisted = _.pick input, _.keys schema.inputSchema
  # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
  whitelisted.author_id = whitelisted.author_id?.toString()
  whitelisted.fair_id = whitelisted.fair_id?.toString()
  Joi.validate whitelisted, schema.inputSchema, callback

@onPublish = (article, author, accessToken, cb) =>
  if not article.published_at
    article.published_at = new Date
  @generateSlugs article, author, cb

@generateSlugs = (article, author, cb) ->
  slug = _s.slugify author.name + ' ' + article.thumbnail_title
  return cb null, article if slug is _.last(article.slugs)
  db.articles.count { slugs: slug }, (err, count) ->
    return cb(err) if err
    slug = slug + '-' + moment(article.published_at).format('MM-DD-YY') if count
    article.slugs = (article.slugs or []).concat slug
    cb(null, article)

@generateKeywords = (article, accessToken, input, cb) ->
  keywords = []
  callbacks = []
  if (input.primary_featured_artist_ids is not article.primary_featured_artist_ids or
      input.featured_artist_ids is not article.featured_artist_ids or
      input.fair_id is not article.fair_id or
      input.partner_ids is not article.partner_ids or
      input.tags is not article.tags)
    return cb(null, article)
  if article.primary_featured_artist_ids
    for artistId in article.primary_featured_artist_ids
      do (artistId) ->
        callbacks.push (callback) ->
          request
            .get("#{ARTSY_URL}/api/v1/artist/#{artistId}")
            .set('X-Xapp-Token': accessToken)
            .end callback
  if article.featured_artist_ids
    for artistId in article.featured_artist_ids
      do (artistId) ->
        callbacks.push (callback) ->
          request
            .get("#{ARTSY_URL}/api/v1/artist/#{artistId}")
            .set('X-Xapp-Token': accessToken)
            .end callback
  if article.fair_id
    callbacks.push (callback) ->
      request
        .get("#{ARTSY_URL}/api/v1/fair/#{article.fair_id}")
        .set('X-Xapp-Token': accessToken)
        .end callback
  if article.partner_ids
    for partnerId in article.partner_ids
      do (partnerId) ->
        callbacks.push (callback) ->
          request
            .get("#{ARTSY_URL}/api/v1/partner/#{partnerId}")
            .set('X-Xapp-Token': accessToken)
            .end callback
  async.parallel callbacks, (err, results) =>
    return cb(err) if err
    keywords = (res.body.name for res in results)
    keywords.push(tag) for tag in article.tags when article.tags
    article.keywords = keywords[0..9]
    cb(null, article)

@generateArtworks = (article, accessToken, input, cb) ->
  # First check if any sections have artworks
  return cb(null, article) unless _.some input.sections, type: 'artworks'
  # Then try to fetch and denormalize the artworks from Gravity asynchonously
  callbacks = []
  for section in input.sections when section.type is 'artworks'
    for artworkId in section.ids
      do (artworkId) ->
        callbacks.push (callback) ->
          request
            .get("#{ARTSY_URL}/api/v1/artwork/#{artworkId}")
            .set('X-Xapp-Token': accessToken)
            .end callback
  async.parallel callbacks, (err, results) =>
    return cb(err) if err
    fetchedArtworks = results.map (result) -> result.body
    for section in input.sections when section.type is 'artworks'
      section.artworks = []
      for artworkId in section.ids
        artwork = _.findWhere fetchedArtworks, _id: artworkId
        if artwork
          section.artworks.push artwork
        else
          section.ids = _.without section.ids, artworkId
      input.sections = _.without input.sections, section if section.ids.length is 0
    article.sections = input.sections
    # Finally return callback with updated article
    cb(null, article)

@sanitizeAndSave = (callback) => (err, article) =>
  return callback err if err
  # Send new content call to Sailthru on any published article save
  if article.published
    @sendArticleToSailthru article, =>
      db.articles.save sanitize(typecastIds article), callback
  else
    db.articles.save sanitize(typecastIds article), callback

@mergeArticleAndAuthor = (article, input, accessToken, cb) =>
  authorId = input.author_id or article.author_id
  User.findOrInsert authorId, accessToken, (err, author) ->
    return callback err if err
    publishing = (input.published and not article.published) || (input.scheduled_publish_at and not article.published)
    article = _.extend article, input, updated_at: new Date
    article.author = User.denormalizedForArticle author if author
    cb null, article, author, publishing

# TODO: Create a Joi plugin for this https://github.com/hapijs/joi/issues/577
sanitize = (article) ->
  sanitized = _.extend article,
    title: sanitizeHtml article.title
    thumbnail_title: sanitizeHtml article.thumbnail_title
    lead_paragraph: sanitizeHtml article.lead_paragraph
    sections: for section in article.sections
      section.body = sanitizeHtml section.body if section.type is 'text'
      section.caption = sanitizeHtml section.caption if section.type is 'image'
      section.url = sanitizeLink section.url if section.type is 'video'
      if section.type is 'slideshow'
        for item in section.items when item.type is 'image' or item.type is 'video'
          item.caption = sanitizeHtml item.caption if item.type is 'image'
          item.url = sanitizeLink item.url if item.type is 'video'
      section
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
  xss $.html()

typecastIds = (article) ->
  _.extend article,
    # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
    _id: ObjectId(article._id)
    contributing_authors: article.contributing_authors.map( (author)->
      author.id = ObjectId(author.id)
      author
    ) if article.contributing_authors
    author_id: ObjectId(article.author_id) if article.author_id
    fair_id: ObjectId(article.fair_id) if article.fair_id
    fair_programming_ids: article.fair_programming_ids.map(ObjectId) if article.fair_programming_ids
    fair_artsy_ids: article.fair_artsy_ids.map(ObjectId) if article.fair_artsy_ids
    fair_about_ids: article.fair_about_ids.map(ObjectId) if article.fair_about_ids
    section_ids: article.section_ids.map(ObjectId) if article.section_ids
    auction_id: ObjectId(article.auction_id) if article.auction_id
    partner_ids: article.partner_ids.map(ObjectId) if article.partner_ids
    show_ids: article.show_ids.map(ObjectId) if article.show_ids
    primary_featured_artist_ids: article.primary_featured_artist_ids.map(ObjectId) if article.primary_featured_artist_ids
    featured_artist_ids: article.featured_artist_ids.map(ObjectId) if article.featured_artist_ids
    featured_artwork_ids: article.featured_artwork_ids.map(ObjectId) if article.featured_artwork_ids
    biography_for_artist_id: ObjectId(article.biography_for_artist_id) if article.biography_for_artist_id
    super_article: if article.super_article?.related_articles then _.extend article.super_article, related_articles: article.super_article.related_articles.map(ObjectId) else {}

@sendArticleToSailthru = (article, cb) =>
  images = {}
  tags = article.keywords or []
  tags = tags.concat ['article']
  tags = tags.concat ['artsy-editorial'] if article.author_id is ARTSY_EDITORIAL_ID
  tags = tags.concat ['magazine'] if article.featured is true
  imageSrc = article.email_metadata?.image_url or article.thumbnail_image
  images =
    full: url: crop(imageSrc, { width: 1200, height: 706 } )
    thumb: url: crop(imageSrc, { width: 900, height: 530 } )
  html = if article.send_body then getTextSections(article) else ''
  sailthru.apiPost 'content',
    url: "#{FORCE_URL}/article/#{_.last(article.slugs)}"
    date: article.published_at
    title: article.email_metadata?.headline or article.thumbnail_title
    author: article.email_metadata?.author or article.author?.name
    tags: tags
    images: images
    spider: 0
    vars:
      credit_line: article.email_metadata?.credit_line
      credit_url: article.email_metadata?.credit_url
      html: html
  , (err, response) =>
    debug err if err
    cb()

getTextSections = (article) ->
  condensedHTML = ""
  for section in article.sections when section.type is 'text'
    condensedHTML = condensedHTML.concat section.body
  condensedHTML

#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "articles" resource.
#

_ = require 'underscore'
_s = require 'underscore.string'
db = require '../../lib/db'
User = require '../users/model'
async = require 'async'
Joi = require 'joi'
Joi.objectId = require('joi-objectid') Joi
moment = require 'moment'
xss = require 'xss'
cheerio = require 'cheerio'
url = require 'url'
request = require 'superagent'
{ ObjectId } = require 'mongojs'
{ ARTSY_URL, API_MAX, API_PAGE_SIZE } = process.env

#
# Schemas
#
imageSection = (->
  @object().keys
    type: @string().valid('image')
    url: @string().allow('', null)
    caption: @string().allow('', null)
).call Joi

videoSection = (->
  @object().keys
    type: @string().valid('video')
    url: @string().allow('', null)
    cover_image_url: @string().allow('', null)
    layout: @string().allow('',null)
    background_color: @string().allow('',null)
).call Joi

fullscreenSection = (->
  @object().keys
    type: @string().valid('fullscreen')
    title: @string().allow('',null)
    intro: @string().allow('',null)
    background_url: @string().allow('',null)
).call Joi

inputSchema = (->
  id: @objectId()
  author_id: @objectId().required()
  tier: @number().default(2)
  thumbnail_title: @string().allow('', null)
  thumbnail_teaser: @string().allow('', null)
  thumbnail_image: @string().allow('', null)
  tags: @array().items(@string()).default([])
  title: @string().allow('', null)
  published: @boolean().default(false)
  published_at: @date()
  scheduled_publish_at: @date().allow(null)
  lead_paragraph: @string().allow('', null)
  gravity_id: @objectId().allow('', null)
  hero_section: @alternatives().try(videoSection, imageSection, fullscreenSection).allow(null)
  sections: @array().items([
    imageSection
    videoSection
    @object().keys
      type: @string().valid('callout')
      thumbnail_url: @string().allow('',null)
      text: @string().allow('',null)
      article: @string().allow('',null)
      hide_image: @boolean().default(false)
    @object().keys
      type: @string().valid('embed')
      url: @string().allow('',null)
      height: @string().allow('',null)
      layout: @string().allow('',null)
    @object().keys
      type: @string().valid('text')
      body: @string().allow('', null)
    @object().keys
      type: @string().valid('artworks')
      ids: @array().items(@objectId())
      layout: @string().allow('overflow_fillwidth', 'column_width', null)
    @object().keys
      type: @string().valid('slideshow')
      items: @array().items [
        imageSection
        videoSection
        @object().keys
          type: @string().valid('artwork')
          id: @string()
      ]
  ]).default([])
  primary_featured_artist_ids: @array().items(@objectId()).allow(null)
  featured_artist_ids: @array().items(@objectId()).allow(null)
  featured_artwork_ids: @array().items(@objectId()).allow(null)
  partner_ids: @array().items(@objectId()).allow(null)
  show_ids: @array().items(@objectId()).allow(null)
  fair_id: @objectId().allow(null)
  fair_programming_ids: @array().items(@objectId()).default([])
  fair_artsy_ids: @array().items(@objectId()).default([])
  fair_about_ids: @array().items(@objectId()).default([])
  auction_id: @objectId().allow(null)
  section_ids: @array().items(@objectId()).default([])
  biography_for_artist_id: @objectId().allow(null)
  featured: @boolean().default(false)
  exclude_google_news: @boolean().default(false)
  contributing_authors: @array().items([
    @object().keys
      id: @objectId().allow(null)
      name: @string().allow('', null)
      profile_id: @string().allow('', null)
    ]).default([])
  email_metadata: @object().keys
    image_url: @string().allow('',null)
    headline: @string().allow('',null)
    author: @string().allow('',null)
    credit_line: @string().allow('',null)
    credit_url: @string().allow('',null)
  is_super_article: @boolean().default(false)
  super_article: @object().keys
    partner_link: @string().allow('',null)
    partner_link_title: @string().allow('',null)
    partner_logo: @string().allow('',null)
    partner_logo_link: @string().allow('',null)
    partner_fullscreen_header_logo: @string().allow('',null)
    secondary_partner_logo: @string().allow('',null)
    secondary_logo_text: @string().allow('',null)
    secondary_logo_link: @string().allow('',null)
    footer_blurb: @string().allow('',null)
    related_articles: @array().items(@objectId()).allow(null)
  share_description: @string().allow('',null)
).call Joi

querySchema = (->
  access_token: @string()
  author_id: @objectId()
  published: @boolean()
  limit: @number().max(Number API_MAX).default(Number API_PAGE_SIZE)
  offset: @number()
  section_id: @objectId()
  artist_id: @objectId()
  artwork_id: @objectId()
  fair_ids: @array()
  fair_programming_id: @objectId()
  fair_artsy_id: @objectId()
  fair_about_id: @objectId()
  show_id: @objectId()
  partner_id: @objectId()
  auction_id: @objectId()
  sort: @string()
  tier: @number()
  featured: @boolean()
  exclude_google_news: @boolean()
  super_article_for: @objectId()
  q: @string()
  all_by_author: @objectId()
  tags: @array()
  is_super_article: @boolean()
).call Joi

#
# Retrieval
#
@where = (input, callback) ->
  toQuery input, (err, query, limit, offset, sort) ->
    return callback err if err
    cursor = db.articles.find(query).skip(offset or 0).sort(sort)
    async.parallel [
      (cb) -> db.articles.count cb
      (cb) -> cursor.count cb
      (cb) -> cursor.limit(limit).toArray cb
    ], (err, [ total, count, results ]) ->
      return callback err if err
      callback null, {
        total: total
        count: count
        results: results
      }

toQuery = (input, callback) ->
  Joi.validate input, querySchema, (err, input) ->
    return callback err if err
    # Separate "find" query from sort/offest/limit
    { limit, offset, sort } = input
    query = _.omit input, 'limit', 'offset', 'sort', 'artist_id', 'artwork_id', 'super_article_for',
      'fair_ids', 'fair_programming_id', 'fair_artsy_id', 'fair_about_id', 'partner_id', 'auction_id', 'show_id', 'q', 'all_by_author', 'section_id', 'tags'
    # Type cast IDs
    # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
    query.author_id = ObjectId input.author_id if input.author_id
    query.fair_id = { $in: _.map(input.fair_ids, ObjectId) } if input.fair_ids
    query.fair_programming_ids = ObjectId input.fair_programming_id if input.fair_programming_id
    query.fair_artsy_ids = ObjectId input.fair_artsy_id if input.fair_artsy_id
    query.fair_about_ids = ObjectId input.fair_about_id if input.fair_about_id
    query.partner_ids = ObjectId input.partner_id if input.partner_id
    query.show_ids = ObjectId input.show_id if input.show_id
    query.auction_id = ObjectId input.auction_id if input.auction_id
    query.section_ids = ObjectId input.section_id if input.section_id
    query.biography_for_artist_id = ObjectId input.biography_for_artist_id if input.biography_for_artist_id
    query.featured_artwork_ids = ObjectId input.artwork_id if input.artwork_id
    query.tags = { $in: input.tags } if input.tags

    # Convert query for super article for article
    query['super_article.related_articles']= ObjectId(input.super_article_for) if input.super_article_for

    # Only add the $or array for queries that require it (blank $or array causes problems)
    query.$or ?= [] if input.artist_id or input.all_by_author

    # Convert query for articles by author
    query.$or.push(
      { author_id: ObjectId(input.all_by_author) }
      { contributing_authors: { $elemMatch: { id: ObjectId input.all_by_author} } }
    ) if input.all_by_author

    # Convert query for articles featured to an artist or artwork
    query.$or.push(
      { primary_featured_artist_ids: ObjectId(input.artist_id) }
      { featured_artist_ids: ObjectId(input.artist_id) }
      { biography_for_artist_id: ObjectId(input.artist_id) }
    ) if input.artist_id

    # Allow regex searching through the q param
    query.thumbnail_title = { $regex: new RegExp(input.q, 'i') } if input.q
    callback null, query, limit, offset, sortParamToQuery(sort)

sortParamToQuery = (input) ->
  return { updated_at: -1 } unless input
  sort = {}
  for param in input.split(',')
    if param.substring(0, 1) is '-'
      sort[param.substring(1)] = -1
    else
      sort[param] = 1
  sort

@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) } else { slugs: id }
  db.articles.findOne query, callback

#
# Persistence
#
@save = (input, accessToken, callback) ->
  validate input, (err, input) =>
    return callback err if err
    mergeArticleAndAuthor input, accessToken, (err, article, author, publishing) ->
      return callback(err) if err
      # Merge fullscreen title with main article title
      article.title = article.hero_section.title if article.hero_section?.type is 'fullscreen'
      if publishing
        onPublish article, author, accessToken, sanitizeAndSave(callback)
      else if not publishing and not article.slugs?.length > 0
        generateSlugs article, author, sanitizeAndSave(callback)
      else
        sanitizeAndSave(callback)(null, article)

validate = (input, callback) ->
  whitelisted = _.pick input, _.keys inputSchema
  # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
  whitelisted.author_id = whitelisted.author_id?.toString()
  whitelisted.fair_id = whitelisted.fair_id?.toString()
  Joi.validate whitelisted, inputSchema, callback

mergeArticleAndAuthor = (input, accessToken, cb) =>
  id = ObjectId (input.id or input._id)?.toString()
  @find id.toString(), (err, article = {}) =>
    return callback err if err
    authorId = input.author_id or article.author_id
    User.findOrInsert authorId, accessToken, (err, author) ->
      return callback err if err
      publishing = (input.published and not article.published) || (input.scheduled_publish_at and not article.published)
      article = _.extend article, input, updated_at: new Date
      article.author = User.denormalizedForArticle author if author
      cb null, article, author, publishing

# After merging article & input

onPublish = (article, author, accessToken, cb) ->
  if not article.published_at
    article.published_at = new Date
  generateKeywords article, accessToken, (err, article) ->
    return cb err if err
    generateSlugs article, author, cb

generateSlugs = (article, author, cb) ->
  slug = _s.slugify author.name + ' ' + article.thumbnail_title
  return cb null, article if slug is _.last(article.slugs)
  db.articles.count { slugs: slug }, (err, count) ->
    return cb(err) if err
    slug = slug + '-' + moment(article.published_at).format('MM-DD-YY') if count
    article.slugs = (article.slugs or []).concat slug
    cb(null, article)

generateKeywords = (article, accessToken, cb) ->
  keywords = []
  callbacks = []
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

sanitizeAndSave = (callback) -> (err, article) ->
  return callback err if err
  db.articles.save sanitize(typecastIds article), callback

@destroy = (id, callback) ->
  db.articles.remove { _id: ObjectId(id) }, callback

#
# JSON views
#
@presentCollection = (article) =>
  {
    total: article.total
    count: article.count
    results: (@present(obj) for obj in article.results)
  }

@present = (article) =>
  _.extend article,
    id: article?._id?.toString()
    _id: undefined
    slug: _.last article.slugs
    slugs: undefined

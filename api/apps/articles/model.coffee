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
Joi.objectId = require 'joi-objectid'
moment = require 'moment'
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
).call Joi

schema = (->
  author_id: @objectId().required()
  tier: @number().default(2)
  slug: @string().allow('', null)
  thumbnail_title: @string().allow('', null)
  thumbnail_teaser: @string().allow('', null)
  thumbnail_image: @string().allow('', null)
  tags: @array().items(@string())
  title: @string().allow('', null)
  published: @boolean().default(false)
  published_at: @date()
  lead_paragraph: @string().allow('', null)
  gravity_id: @objectId().allow('', null)
  hero_section: @alternatives().try(videoSection, imageSection).allow(null)
  sections: @array().items([
    imageSection
    videoSection
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
        @object().keys
          type: @string().valid('image')
          url: @string().allow('', null)
          caption: @string().allow('', null)
        @object().keys
          type: @string().valid('video')
          url: @string().allow('', null)
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
  auction_id: @objectId().allow(null)
  vertical_id: @objectId().allow(null)
  biography_for_artist_id: @objectId().allow(null)
  featured: @boolean().default(false)
  exclude_google_news: @boolean().default(false)
  contributing_authors: @array().items([
    @object().keys
      id: @objectId().allow(null)
      name: @string().allow('', null)
      profile_id: @string().allow('', null)
    ]).default([])
).call Joi

querySchema = (->
  access_token: @string()
  author_id: @objectId()
  published: @boolean()
  limit: @number().max(Number API_MAX).default(Number API_PAGE_SIZE)
  offset: @number()
  vertical_id: @objectId()
  artist_id: @objectId()
  artwork_id: @objectId()
  fair_ids: @array()
  show_id: @objectId()
  partner_id: @objectId()
  auction_id: @objectId()
  sort: @string()
  tier: @number()
  featured: @boolean()
  exclude_google_news: @boolean()
  q: @string()
  all_by_author: @objectId()
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
    query = _.omit input, 'limit', 'offset', 'sort', 'artist_id', 'artwork_id',
      'fair_ids', 'partner_id', 'auction_id', 'show_id', 'q', 'all_by_author'
    # Type cast IDs
    # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
    query.author_id = ObjectId input.author_id if input.author_id
    query.fair_id = { $in: _.map(input.fair_ids, ObjectId) } if input.fair_ids
    query.partner_ids = ObjectId input.partner_id if input.partner_id
    query.show_ids = ObjectId input.show_id if input.show_id
    query.auction_id = ObjectId input.auction_id if input.auction_id
    query.vertical_id = ObjectId input.vertical_id if input.vertical_id
    query.biography_for_artist_id = ObjectId input.biography_for_artist_id if input.biography_for_artist_id

    query.$or = [
      { author_id: ObjectId(input.all_by_author) }
      { contributing_authors: { $elemMatch: { id: ObjectId input.all_by_author} } }
    ] if input.all_by_author

    # Convert query for articles featured to an artist or artwork
    query.$or = [
      { primary_featured_artist_ids: ObjectId(input.artist_id) }
      { featured_artist_ids: ObjectId(input.artist_id) }
      { biography_for_artist_id: ObjectId(input.artist_id) }
    ] if input.artist_id
    query.featured_artwork_ids = ObjectId input.artwork_id if input.artwork_id
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
  id = ObjectId (input.id or input._id)?.toString()
  validate input, (err, input) =>
    return callback err if err
    @find id.toString(), (err, article = {}) =>
      return callback err if err
      authorId = input.author_id or article.author_id
      User.findOrInsert authorId, accessToken, (err, author) ->
        return callback err if err
        article = update article, input, author
        db.articles.save _.extend(article,
          _id: id
          # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
          author_id: ObjectId(article.author_id) if article.author_id
          fair_id: ObjectId(article.fair_id) if article.fair_id
          vertical_id: ObjectId(article.vertical_id) if article.vertical_id
          auction_id: ObjectId(article.auction_id) if article.auction_id
          partner_ids: article.partner_ids.map(ObjectId) if article.partner_ids
          show_ids: article.show_ids.map(ObjectId) if article.show_ids
          primary_featured_artist_ids: article.primary_featured_artist_ids.map(ObjectId) if article.primary_featured_artist_ids
          featured_artist_ids: article.featured_artist_ids.map(ObjectId) if article.featured_artist_ids
          featured_artwork_ids: article.featured_artwork_ids.map(ObjectId) if article.featured_artwork_ids
          biography_for_artist_id: ObjectId(article.biography_for_artist_id) if article.biography_for_artist_id
          contributing_authors: article.contributing_authors.map( (author)->
            author.id = ObjectId(author.id)
            author
          ) if article.contributing_authors
        ), callback

validate = (input, callback) ->
  whitelisted = _.pick input, _.keys schema
  # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
  whitelisted.author_id = whitelisted.author_id?.toString()
  whitelisted.fair_id = whitelisted.fair_id?.toString()
  Joi.validate whitelisted, schema, callback

update = (article, input, author) ->
  if input.published and not article.published and not input.published_at
    input.published_at = new Date
  article = _.extend article, input, updated_at: new Date
  article = addSlug article, input, author
  article.author = User.denormalizedForArticle author if author
  article

addSlug = (article, input, author) ->
  titleSlug = _s.slugify(article.title).split('-')[0..7].join('-')
  article.slugs ?= []
  #Don't change the article slug unless it's unpublished or a new slug is added
  if input.slug? and (input.slug != _.last(article.slugs))
    slug = input.slug
  else if article.published is false
    slug = if author then _s.slugify(author.name) + '-' + titleSlug else titleSlug
  else
    return article
  article.slugs = _.unique(article.slugs).concat [slug]
  article

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

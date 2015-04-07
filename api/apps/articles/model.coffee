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
request = require 'superagent'
{ ObjectId } = require 'mongojs'
{ ARTSY_URL } = process.env

#
# Schemas
#
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
  sections: @array().items([
    @object().keys
      type: @string().valid('image')
      url: @string().allow('', null)
      caption: @string().allow('', null)
    @object().keys
      type: @string().valid('text')
      body: @string().allow('', null)
    @object().keys
      type: @string().valid('artworks')
      ids: @array().items(@objectId())
      layout: @string().allow('overflow_fillwidth', 'column_width', null)
    @object().keys
      type: @string().valid('video')
      url: @string().allow('', null)
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
  fair_id: @objectId().allow(null)
  auction_id: @objectId().allow(null)
  featured: @boolean().default(false)
).call Joi

querySchema = (->
  author_id: @objectId()
  published: @boolean()
  limit: @number()
  offset: @number()
  artist_id: @objectId()
  artwork_id: @objectId()
  fair_ids: @array()
  partner_id: @objectId()
  auction_id: @objectId()
  sort: @string()
  tier: @number()
  featured: @boolean()
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
      (cb) -> cursor.limit(limit or 10).toArray cb
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
      'fair_ids', 'partner_id', 'auction_id'
    # Type cast IDs
    query.author_id = ObjectId input.author_id if input.author_id
    query.fair_id = { $in: _.map(input.fair_ids, ObjectId) } if input.fair_ids
    query.partner_ids = ObjectId input.partner_id if input.partner_id
    query.auction_id = ObjectId input.auction_id if input.auction_id
    # Convert query for articles featured to an artist or artwork
    query.$or = [
      { primary_featured_artist_ids: ObjectId(input.artist_id) }
      { featured_artist_ids: ObjectId(input.artist_id) }
    ] if input.artist_id
    query.featured_artwork_ids = ObjectId input.artwork_id if input.artwork_id
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
@save = (input, cb) ->
  id = ObjectId (input.id or input._id)?.toString()
  validate input, (err, input) =>
    return cb err if err
    @find id.toString(), (err, article = {}) =>
      return cb err if err
      update article, input, (err, article) =>
        return cb err if err
        db.articles.save _.extend(article,
          _id: id
          # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
          author_id: ObjectId(article.author_id) if article.author_id
          fair_id: ObjectId(article.fair_id) if article.fair_id
          auction_id: ObjectId(article.auction_id) if article.auction_id
          partner_ids: article.partner_ids.map(ObjectId) if article.partner_ids
          primary_featured_artist_ids: article.primary_featured_artist_ids.map(ObjectId) if article.primary_featured_artist_ids
          featured_artist_ids: article.featured_artist_ids.map(ObjectId) if article.featured_artist_ids
          featured_artwork_ids: article.featured_artwork_ids.map(ObjectId) if article.featured_artwork_ids
        ), cb

validate = (input, callback) ->
  whitelisted = _.pick input, _.keys schema
  # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
  whitelisted.author_id = whitelisted.author_id?.toString()
  whitelisted.fair_id = whitelisted.fair_id?.toString()
  Joi.validate whitelisted, schema, callback

update = (article, input, callback) ->
  if input.published and not article.published and not input.published_at
    input.published_at = new Date
  User.find (input.author_id or article.author_id), (err, author) ->
    return callback err if err
    article = _.extend article, input, updated_at: new Date
    article = addSlug article, input, author
    article = denormalizeAuthor article, author
    callback null, article

addSlug = (article, input, author, callback) ->
  titleSlug = _s.slugify(article.title).split('-')[0..7].join('-')
  article.slugs ?= []
  #Don't change the article slug unless it's unpublished or a new slug is added
  if input.slug? and (input.slug != _.last(article.slugs))
    slug = input.slug
  else if article.published is false
    slug = if author then _s.slugify(author.user.name) + '-' + titleSlug else titleSlug
  else
    return article
  article.slugs = _.unique(article.slugs).concat [slug]
  article

denormalizeAuthor = (article, author, callback) ->
  article.author = User.denormalizedForArticle(author) if author
  article

@destroy = (id, callback) ->
  db.articles.remove { _id: ObjectId(id) }, (err, res) ->
    callback err, res

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

#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "articles" resource.
#

_ = require 'underscore'
_s = require 'underscore.string'
db = require '../../lib/db'
async = require 'async'
Joi = require 'joi'
Joi.objectId = require 'joi-objectid'
moment = require 'moment'
{ ObjectId } = require 'mongojs'

# Validation

schema = (->
  author_id: @objectId().required()
  thumbnail_title: @string().allow('', null)
  thumbnail_teaser: @string().allow('', null)
  thumbnail_image: @string().allow('', null)
  tags: @array().includes(@string())
  title: @string().allow('', null)
  published: @boolean().default(false)
  lead_paragraph: @string().allow('', null)
  sections: @array().includes [
    @object().keys
      type: @string().valid('image')
      url: @string().allow('', null)
      caption: @string().allow('', null)
    @object().keys
      type: @string().valid('text')
      body: @string().allow('', null)
    @object().keys
      type: @string().valid('artworks')
      ids: @array().includes(@string())
      layout: @string().allow('overflow_fillwidth', 'column_width', null)
    @object().keys
      type: @string().valid('video')
      url: @string().allow('', null)
    @object().keys
      type: @string().valid('slideshow')
      items: @array()
  ]
  featured_artist_ids: @array().includes(@string())
  featured_artwork_ids: @array().includes(@string())
).call Joi

querySchema = (->
  author_id: @objectId()
  published: @boolean()
  limit: @number()
  offset: @number()
).call Joi

# Retrieval

@where = (query, callback) ->
  Joi.validate query, querySchema, (err, query) ->
    query.author_id = ObjectId(query.author_id) if query.author_id
    return callback err if err
    { limit, offset } = query
    query = _.omit query, 'limit', 'offset'
    cursor = db.articles.find(query).skip(offset or 0)
    async.parallel [
      (cb) -> db.articles.count cb
      (cb) -> cursor.count cb
      (cb) -> cursor.limit(limit or 10).sort(updated_at: -1).toArray cb
    ], (err, results) ->
      return callback err if err
      callback null, {
        total: results[0]
        count: results[1]
        results: results[2]
      }

@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) } else { slugs: id }
  db.articles.findOne query, (err, doc) ->
    return callback err if err
    callback null, doc

# Persistence

@save = (data, callback) ->
  id = ObjectId data._id
  whitelisted = _.pick data, _.keys schema
  whitelisted.author_id = whitelisted.author_id?.toString()
  Joi.validate whitelisted, schema, (err, data) ->
    return callback err if err
    db.articles.findOne { _id: id }, (err, article) ->
      return callback err if err
      data = _.extend (article or {}), { slugs: [] }, data
      data.updated_at = moment().format()
      data.author_id = ObjectId data.author_id
      slug = _s.slugify data.title
      data.slugs = data.slugs.concat [slug] unless slug in data.slugs
      db.articles.update { _id: id }, data, { upsert: true }, (err, res) ->
        return callback err if err
        callback null, _.extend data, _id: res.upserted?[0]?._id or id

@destroy = (id, callback) ->
  db.articles.remove { _id: ObjectId(id) }, (err, res) ->
    callback err, res

# JSON views

@presentCollection = (data) =>
  {
    total: data.total
    count: data.count
    results: (@present(obj) for obj in data.results)
  }

@present = (data) =>
  _.extend data,
    id: data._id?.toString()
    _id: undefined
    slug: _.last data.slugs
    slugs: undefined
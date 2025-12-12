#
# Library of retrieval, persistance, validation, json view, and domain logic for the "authors" resource.
#

{ extend, omit } = require 'underscore'
_s = require 'underscore.string'
db = require '../../lib/db'
async = require 'async'
Joi = require '../../lib/joi'
{ ObjectId } = require 'mongodb-legacy'
{ API_MAX, API_PAGE_SIZE } = process.env

#
# Schemas
#
@schema = ( ->
  id: @string().objectid()
  name: @string().allow('', null).default('')
  bio: @string().allow('', null).default('')
  image_url: @string().allow('', null).default('')
  twitter_handle: @string().allow('', null).default('')
  instagram_handle: @string().allow('', null).default('')
  website: @string().allow('', null).default('')
  role: @string().allow('', null).default('')
  slug: @string().allow('', null)
).call Joi

@querySchema = (->
  q: @string().allow('')
  limit: @number().max(Number API_MAX).default(Number API_PAGE_SIZE)
  offset: @number()
  count: @boolean().default(false)
  ids: @array().items(@string().objectid())
).call Joi

#
# Retrieval
#
@find = (id, callback) ->
  if ObjectId.isValid(id)
    query = { _id: new ObjectId(id) }
  else
    query = { $or: [{ slug: id }, { name: id }] }
  db.collection("authors").findOne query, callback

@where = (input, callback) =>
  Joi.validate input, @querySchema, (err, input) =>
    return callback err if err
    @mongoFetch input, callback

@mongoFetch = (input, callback) ->
  query = omit input, 'q', 'limit', 'offset', 'count', 'strict', 'ids'

  if input.strict
    query.name = { $eq: input.q } if input.q and input.q.length
  else
    query.name = { $regex: ///#{input.q}///i } if input.q and input.q.length
  query._id = { $in: input.ids } if input.ids
  cursor = db.collection("authors")
    .find(query)
    .limit(input.limit or Number API_PAGE_SIZE)
    .sort($natural: -1)
    .skip(input.offset or 0)
  async.parallel [
    (cb) -> cursor.toArray cb
    (cb) ->
      return cb() unless input.count
      db.collection("authors").countDocuments query, cb
    (cb) ->
      return cb() unless input.count
      db.collection("authors").count cb
  ], (err, [authors, authorCount, total]) =>
    callback err, {
      total: total if input.count
      count: authorCount if input.count
      results: authors.map(@present)
    }

#
# Persistence
#
generateSlug = (name, existingSlug, excludeId, callback) ->
  baseSlug = if existingSlug then existingSlug else _s.slugify(name)
  return callback(null, baseSlug) unless name and baseSlug

  query = { slug: { $regex: ///^#{baseSlug}(-\d+)?$/// } }
  query._id = { $ne: excludeId } if excludeId

  db.collection("authors").find(query).toArray (err, existingAuthors) ->
    return callback(err) if err

    return callback(null, baseSlug) if existingAuthors.length is 0

    existingSlugs = existingAuthors.map((a) -> a.slug)
    return callback(null, baseSlug) unless baseSlug in existingSlugs

    maxCounter = 0
    for slug in existingSlugs
      match = slug.match(///^#{baseSlug}-(\d+)$///)
      if match
        counter = parseInt(match[1], 10)
        maxCounter = counter if counter > maxCounter

    callback(null, "#{baseSlug}-#{maxCounter + 1}")

@save = (input, callback) ->
  Joi.validate input, @schema, (err, input) =>
    return callback err if err

    generateSlug input.name, input.slug, input.id, (err, slug) =>
      return callback(err) if err

      data = extend omit(input, 'id'),
        _id: input.id
        slug: slug

      if data._id
        db.collection("authors").updateOne { _id: data._id }, { $set: data }, (err, res) ->
          db.collection("authors").findOne { _id: data._id }, callback
      else
        db.collection("authors").insertOne data, (err, res) ->
          db.collection("authors").findOne { _id: res.insertedId }, callback

@destroy = (id, callback) ->
  db.collection("authors").removeOne { _id: new ObjectId(id) }, callback

#
# JSON views
#
@present = (author) =>
  extend
    id: author?._id?.toString()
  , omit(author, '_id')

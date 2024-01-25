#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "tags" resource.
#

_ = require 'underscore'
db = require '../../lib/db'
async = require 'async'
Joi = require '../../lib/joi'
{ ObjectId } = require 'mongodb'
{ API_MAX, API_PAGE_SIZE } = process.env

#
# Schemas
#
@schema = (->
  id: @string().objectid()
  name: @string().allow('', null).required()
  public: @boolean().default(false)
).call Joi

@querySchema = (->
  q: @string().allow('')
  limit: @number().max(Number API_MAX).default(Number API_PAGE_SIZE)
  offset: @number()
  count: @boolean().default(false)
  public: @boolean()
  strict: @boolean().default(false)
).call Joi

#
# Retrieval
#
@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: new ObjectId(id) } else { name: id }
  db.collection('tags').findOne query, callback

@where = (input, callback) =>
  Joi.validate input, @querySchema, (err, input) =>
    return callback err if err
    @mongoFetch input, callback

@mongoFetch = (input, callback) ->
  query = _.omit input, 'q', 'limit', 'offset', 'count', 'strict'
  if input.strict
    query.name = { $eq: input.q } if input.q and input.q.length
  else
    query.name = { $regex: ///#{input.q}///i } if input.q and input.q.length
  cursor = db.collection 'tags'
    .find(query)
    .limit(input.limit)
    .sort($natural: -1)
    .skip(input.offset or 0)
  async.parallel [
    (cb) -> cursor.toArray cb
    (cb) ->
      return cb() unless input.count
      cursor.count cb
    (cb) ->
      return cb() unless input.count
      db.collection('tags').count cb
  ], (err, [tags, tagCount, total]) =>
    callback err, {
      total: total if input.count
      count: tagCount if input.count
      results: tags.map(@present)
    }

#
# Persistence
#
@save = (input, callback) ->
  Joi.validate input, @schema, (err, input) =>
    return callback err if err
    data = _.extend _.omit(input, 'id'),
      _id: input.id
    db.collection('tags').insertOne data, (err, res) ->
      db.collection('tags').findOne {_id: res.insertedId}, callback

@destroy = (id, callback) ->
  db.collection('tags').remove { _id: new ObjectId(id) }, callback

#
# JSON views
#
@present = (tag) =>
  _.extend
    id: tag?._id?.toString()
  , _.omit(tag, '_id')

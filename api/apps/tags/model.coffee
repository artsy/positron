#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "tags" resource.
#

_ = require 'underscore'
db = require '../../lib/db'
async = require 'async'
Joi = require 'joi'
Joi.objectId = require('joi-objectid') Joi
{ ObjectId } = require 'mongojs'
{ API_MAX, API_PAGE_SIZE } = process.env

#
# Schemas
#
@schema = (->
  id: @objectId()
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
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) } else { name: id }
  db.tags.findOne query, callback

@where = (input, callback) ->
  Joi.validate input, @querySchema, (err, input) =>
    return callback err if err
    query = _.omit input, 'q', 'limit', 'offset', 'count', 'strict'
    if input.strict
      query.name = { $eq: input.q } if input.q and input.q.length
    else
      query.name = { $regex: ///#{input.q}///i } if input.q and input.q.length
    cursor = db.tags
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
        db.tags.count cb
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
      _id: ObjectId(input.id)
    db.tags.save data, callback

@destroy = (id, callback) ->
  db.tags.remove { _id: ObjectId(id) }, callback

#
# JSON views
#
@present = (tag) =>
  _.extend
    id: tag?._id?.toString()
  , _.omit(tag, '_id')

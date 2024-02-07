#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "verticals" resource.
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
).call Joi

@querySchema = (->
  q: @string().allow('')
  limit: @number().max(Number API_MAX).default(Number API_PAGE_SIZE)
  offset: @number()
  count: @boolean().default(false)
).call Joi

#
# Retrieval
#
@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: new ObjectId(id) } else { name: id }
  db.collection('verticals').findOne query, callback

@where = (input, callback) =>
  Joi.validate input, @querySchema, (err, input) =>
    return callback err if err
    @mongoFetch input, callback

@mongoFetch = (input, callback) =>
  query = _.omit input, 'q', 'limit', 'offset', 'count'
  query.name = { $regex: ///#{input.q}///i } if input.q and input.q.length
  cursor = db.collection('verticals')
    .find(query)
    .limit(input.limit)
    .sort($natural: -1)
    .skip(input.offset or 0)
  async.parallel [
    (cb) -> cursor.toArray cb
    (cb) ->
      return cb() unless input.count
      db.collection('verticals').countDocuments(query, cb)
    (cb) ->
      return cb() unless input.count
      db.collection('verticals').count cb
  ], (err, [verticals, verticalCount, total]) =>
    callback err, {
      total: total if input.count
      count: verticalCount if input.count
      results: verticals.map(@present)
    }

#
# Persistence
#
@save = (input, callback) ->
  Joi.validate input, @schema, (err, input) ->
    return callback err if err
    data = _.extend _.omit(input, 'id'),
      _id: input.id
    if data._id
      db.collection("verticals").updateOne { _id: data._id }, { $set: data }, (err, res) ->
        db.collection("verticals").findOne { _id: data._id }, callback
    else
      db.collection("verticals").insertOne data, (err, res) ->
        db.collection("verticals").findOne { _id: res.insertedId }, callback

@destroy = (id, callback) ->
  db.collection('verticals').remove { _id: new ObjectId(id) }, callback

#
# JSON views
#
@present = (vertical) ->
  _.extend
    id: vertical?._id?.toString()
  , _.omit(vertical, '_id')

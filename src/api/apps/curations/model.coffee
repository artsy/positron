#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "curation" resource.
#

_ = require 'underscore'
_s = require 'underscore.string'
db = require '../../lib/db'
User = require '../users/model'
async = require 'async'
Joi = require '../../lib/joi'
moment = require 'moment'
request = require 'superagent'
{ ObjectId } = require 'mongodb-legacy'
{ ARTSY_URL, API_MAX, API_PAGE_SIZE } = process.env

OPTIONS = { allowUnknown: true, stripUnknown: false }

#
# Schemas
#
@schema = (->
  id: @string().objectid()
  name: @string().allow('', null)
).call Joi

@querySchema = (->
  limit: @number().max(Number API_MAX).default(Number API_PAGE_SIZE)
  offset: @number()
).call Joi

#
# Retrieval
#
@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: new ObjectId(id) }
  db.collection('curations').findOne query, callback

@where = (input, callback) =>
  Joi.validate input, @querySchema, (err, input) =>
    return callback err if err
    @mongoFetch input, callback

@mongoFetch = (input, callback) ->
  query = _.omit input, 'limit', 'offset'
  cursor = db.collection('curations')
    .find(query)
    .limit(input.limit or Number API_PAGE_SIZE)
    .sort($natural: -1)
    .skip(input.offset or 0)
  async.parallel [
    (cb) -> cursor.toArray cb
    (cb) -> db.collection('curations').countDocuments(query, cb)
    (cb) -> db.collection('curations').count cb
  ], (err, [curations, count, total]) =>
    callback err, {
      total: total
      count: count
      results: curations.map(@present)
    }

#
# Persistence
#
@save = (input, callback) ->
  Joi.validate input, @schema, OPTIONS, (err, input) =>
    return callback err if err
    data = _.extend _.omit(input, 'id'),
      _id: input.id
    if data._id
      db.collection("curations").updateOne { _id: data._id }, { $set: data }, (err, res) ->
        db.collection("curations").findOne { _id: data._id }, callback
    else
      db.collection("curations").insertOne data, (err, res) ->
        db.collection("curations").findOne { _id: res.insertedId }, callback

@destroy = (id, callback) ->
  db.collection('curations').deleteOne { _id: new ObjectId(id) }, callback

#
# JSON views
#
@present = (curation) =>
  _.extend
    id: curation?._id?.toString()
  , _.omit(curation, '_id')

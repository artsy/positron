#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "curation" resource.
#

_ = require 'underscore'
_s = require 'underscore.string'
db = require '../../lib/db'
User = require '../users/model'
async = require 'async'
Joi = require 'joi'
Joi.objectId = require('joi-objectid') Joi
moment = require 'moment'
request = require 'superagent'
{ ObjectId } = require 'mongojs'
{ ARTSY_URL, API_MAX, API_PAGE_SIZE } = process.env

OPTIONS = { allowUnknown: true, stripUnknown: false }

#
# Schemas
#
@schema = (->
  id: @objectId()
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
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) }
  db.curations.findOne query, callback

@where = (input, callback) ->
  Joi.validate input, @querySchema, (err, input) =>
    return callback err if err
    query = _.omit input, 'limit', 'offset'
    cursor = db.curations
      .find(query)
      .limit(input.limit)
      .sort($natural: -1)
      .skip(input.offset or 0)
    async.parallel [
      (cb) -> cursor.toArray cb
      (cb) -> cursor.count cb
      (cb) -> db.curations.count cb
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
      _id: ObjectId(input.id)
      # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
    db.curations.save data, callback

@destroy = (id, callback) ->
  db.curations.remove { _id: ObjectId(id) }, callback

#
# JSON views
#
@present = (curation) =>
  _.extend
    id: curation?._id?.toString()
  , _.omit(curation, '_id')

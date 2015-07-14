#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "organizations" resource.
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
{ ARTSY_URL, API_MAX, API_PAGE_SIZE } = process.env

#
# Schemas
#
schema = (->
  id: @objectId()
  name: @string().allow('', null)
  slug: @string().allow('', null)
  icon_url: @string().allow('', null)
  author_ids: @array().items(@objectId()).allow(null)
).call Joi

querySchema = (->
  limit: @number().max(Number API_MAX).default(Number API_PAGE_SIZE)
  offset: @number()
).call Joi

#
# Retrieval
#
@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) } else { slug: id }
  db.organizations.findOne query, callback

@where = (input, callback) ->
  Joi.validate input, querySchema, (err, input) =>
    return callback err if err
    query = _.omit input, 'limit', 'offset'
    cursor = db.organizations
      .find(query)
      .limit(input.limit)
      .sort($natural: -1)
      .skip(input.offset)
    async.parallel [
      (cb) -> cursor.toArray cb
      (cb) -> cursor.count cb
      (cb) -> db.organizations.count cb
    ], (err, [organizations, count, total]) =>
      callback err, {
        total: total
        count: count
        results: organizations.map(@present)
      }

#
# Persistence
#
@save = (input, callback) ->
  Joi.validate input, schema, (err, input) =>
    return callback err if err
    data = _.extend _.omit(input, 'id'),
      _id: ObjectId(input.id)
      # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
      author_ids: input.author_ids.map(ObjectId) if input.author_ids
    db.organizations.save data, callback

@destroy = (id, callback) ->
  db.organizations.remove { _id: ObjectId(id) }, callback

#
# JSON views
#
@present = (organization) =>
  _.extend
    id: organization?._id?.toString()
  , _.omit(organization, '_id')

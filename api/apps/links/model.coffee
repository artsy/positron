#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "links" resource.
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

#
# Schemas
#
schema = (->
  id: @objectId()
  title: @string().allow('', null)
  slug: @string().allow('', null)
  featured_links: @array().items([
    @object().keys
      thumbnail_url: @string().allow('', null)
      title: @string().allow('', null)
      url: @string().allow('', null)
  ]).allow(null)
).call Joi

querySchema = (->
  limit: @number().max(Number API_MAX).default(Number API_PAGE_SIZE)
  offset: @number()
  slug: @string()
).call Joi

#
# Retrieval
#
@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) } else { slug: id }
  db.links.findOne query, callback

@where = (input, callback) ->
  Joi.validate input, querySchema, (err, input) =>
    return callback err if err
    query = _.omit input, 'limit', 'offset'
    cursor = db.links
      .find(query)
      .limit(input.limit)
      .sort($natural: -1)
      .skip(input.offset)
    async.parallel [
      (cb) -> cursor.toArray cb
      (cb) -> cursor.count cb
      (cb) -> db.links.count cb
    ], (err, [linkSets, count, total]) =>
      callback err, {
        total: total
        count: count
        results: linkSets.map(@present)
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
    db.links.save data, callback

@destroy = (id, callback) ->
  db.links.remove { _id: ObjectId(id) }, callback

#
# JSON views
#
@present = (linkSet) =>
  _.extend
    id: linkSet?._id?.toString()
  , _.omit(linkSet, '_id')

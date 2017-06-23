#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "channels" resource.
#

_ = require 'underscore'
_s = require 'underscore.string'
db = require '../../lib/db'
User = require '../users/model'
async = require 'async'
Joi = require '../../lib/joi'
moment = require 'moment'
request = require 'superagent'
{ ObjectId } = require 'mongojs'
{ ARTSY_URL, API_MAX, API_PAGE_SIZE } = process.env

#
# Schemas
#
@schema = (->
  id: @string().objectid()
  name: @string().allow('', null)
  user_ids: @array().items(@string().objectid()).default([])
  type: @string().allow('', null)
  image_url: @string().allow('',null)
  tagline: @string().allow('',null)
  links: @array().max(3).items([
    url: @string().allow('',null)
    text: @string().allow('',null)
  ]).allow(null).default([])
  slug: @string().allow('',null)
  pinned_articles: @array().max(6).items(
    @object().keys
      index: @number()
      id: @string().objectid()
  ).default([])
).call Joi

@querySchema = (->
  limit: @number().max(Number API_MAX).default(Number API_PAGE_SIZE)
  offset: @number()
  user_id: @string().objectid()
  q: @string()
).call Joi

#
# Retrieval
#
@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) } else { slug: id }
  db.channels.findOne query, (err, channel) ->
    return callback new Error 'No channel found' unless channel
    callback null, channel

@where = (input, callback) =>
  Joi.validate input, @querySchema, (err, input) =>
    return callback err if err
    @mongoFetch input, callback

@mongoFetch = (input, callback) ->
  query = _.omit input, 'limit', 'offset', 'q', 'user_id'
  query.name = { $regex: ///#{input.q}///i } if input.q
  query.user_ids = input.user_id if input.user_id
  cursor = db.channels
    .find(query)
    .limit(input.limit)
    .sort($natural: -1)
    .skip(input.offset or 0)
  async.parallel [
    (cb) -> cursor.toArray cb
    (cb) -> cursor.count cb
    (cb) -> db.channels.count cb
  ], (err, [channels, count, total]) =>
    callback err, {
      total: total
      count: count
      results: channels.map(@present)
    }

#
# Persistence
#
@save = (input, callback) ->
  Joi.validate input, @schema, (err, input) =>
    return callback err if err
    data = _.extend _.omit(input, 'id'),
      _id: input.id
      slug: _s.slugify(input.slug) if input.slug
    db.channels.save data, callback

@destroy = (id, callback) ->
  db.channels.remove { _id: ObjectId(id) }, callback

#
# JSON views
#
@present = (channel) =>
  _.extend
    id: channel?._id?.toString()
  , _.omit(channel, '_id')

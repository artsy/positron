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
{ ObjectId } = require 'mongodb-legacy'
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
  sort: @string()
).call Joi

#
# Retrieval
#
@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: new ObjectId(id) } else { slug: id }
  db.collection('channels').findOne query, (err, channel) ->
    return callback new Error 'No channel found' unless channel
    callback null, channel

@where = (input, callback) =>
  Joi.validate input, @querySchema, (err, input) =>
    return callback err if err
    @mongoFetch input, callback

@mongoFetch = (input, callback) ->
  query = _.omit input, 'limit', 'offset', 'q', 'user_id', 'sort'
  query.name = { $regex: ///#{input.q}///i } if input.q
  query.user_ids = input.user_id if input.user_id
  cursor = db.collection 'channels'
    .find(query)
    .limit(input.limit)
    .sort(sortParamToQuery(input.sort))
    .skip(input.offset or 0)
  async.parallel [
    (cb) -> cursor.toArray cb
    (cb) -> db.collection('channels').countDocuments query, cb
    (cb) -> db.collection('channels').count cb
  ], (err, [channels, count, total]) =>
    callback err, {
      total: total
      count: count
      results: channels.map(@present)
    }

sortParamToQuery = (input) ->
  return { updated_at: -1 } unless input
  sort = {}
  for param in input.split(',')
    if param.substring(0, 1) is '-'
      sort[param.substring(1)] = -1
    else
      sort[param] = 1
  sort

#
# Persistence
#
@save = (input, callback) ->
  Joi.validate input, @schema, (err, input) =>
    return callback err if err
    data = _.extend _.omit(input, 'id'),
      _id: input.id
      slug: _s.slugify(input.slug) if input.slug
    if data._id
      db.collection('channels').updateOne { _id: data._id }, { $set: data }, (err, res) ->
        db.collection('channels').findOne { _id: data._id }, callback
    else
      db.collection('channels').insertOne data, (err, res) ->
        db.collection('channels').findOne { _id: res.insertedId }, callback

@destroy = (id, callback) ->
  db.collection('channels').remove { _id: new ObjectId(id) }, callback

#
# JSON views
#
@present = (channel) =>
  _.extend
    id: channel?._id?.toString()
  , _.omit(channel, '_id')

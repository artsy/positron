#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "sections" resource.
#

_ = require 'underscore'
_s = require 'underscore.string'
db = require '../../lib/db'
User = require '../users/model'
async = require 'async'
Joi = require '../../lib/joi'
moment = require 'moment'
request = require 'superagent'
{ ObjectId } = require 'mongodb'
{ ARTSY_URL, API_MAX, API_PAGE_SIZE } = process.env

#
# Schemas
#
schema = (->
  id: @string().objectid()
  title: @string().allow('', null)
  meta_title: @string().allow('', null)
  description: @string().allow('', null)
  slug: @string().allow('', null)
  partner_logo_url: @string().allow('', null)
  partner_website_url: @string().allow('', null)
  thumbnail_url: @string().allow('', null)
  featured_links_header: @string().allow('', null)
  featured_links: @array().items([
    @object().keys
      thumbnail_url: @string().allow('', null)
      title: @string().allow('', null)
      url: @string().allow('', null)
  ]).allow(null)
  featured: @boolean().default(false)
  start_at: @date().allow(null)
  end_at: @date().allow(null)
  slogan: @string().allow('',null)
).call Joi

querySchema = (->
  q: @string()
  limit: @number().max(Number API_MAX).default(Number API_PAGE_SIZE)
  offset: @number()
  featured: @boolean()
).call Joi

#
# Retrieval
#
@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: new ObjectId(id) } else { slug: id }
  db.collection('sections').findOne query, callback

@where = (input, callback) ->
  Joi.validate input, querySchema, (err, input) =>
    return callback err if err
    query = _.omit input, 'q', 'limit', 'offset'
    query.title = { $regex: ///#{input.q}///i } if input.q
    cursor = db.collection('sections')
      .find(query)
      .limit(input.limit)
      .sort($natural: -1)
      .skip(input.offset or 0)
    async.parallel [
      (cb) -> cursor.toArray cb
      (cb) -> cursor.count cb
      (cb) -> db.collection('sections').count cb
    ], (err, [sections, count, total]) =>
      callback err, {
        total: total
        count: count
        results: sections.map(@present)
      }

#
# Persistence
#
@save = (input, callback) ->
  Joi.validate input, schema, (err, input) =>
    return callback err if err
    data = _.extend _.omit(input, 'id'),
      _id: input.id
    if data._id
      db.collection("sections").updateOne { _id: data._id }, { $set: data }, (err, res) ->
        db.collection("sections").findOne { _id: data._id }, callback
    else
      db.collection("sections").insertOne data, (err, res) ->
        db.collection("sections").findOne { _id: res.insertedId }, callback

@destroy = (id, callback) ->
  db.collection('sections').remove { _id: new ObjectId(id) }, callback

#
# JSON views
#
@present = (section) =>
  _.extend
    id: section?._id?.toString()
  , _.omit(section, '_id')

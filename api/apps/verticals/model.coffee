#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "verticals" resource.
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
{ ARTSY_URL } = process.env

#
# Schemas
#
schema = (->
  id: @objectId()
  title: @string().allow('', null)
  description: @string().allow('', null)
  slug: @string().allow('', null)
  partner_logo_url: @string().allow('', null)
  partner_website_url: @string().allow('', null)
  thumbnail_url: @string().allow('', null)
  featured_article_ids: @array().items(@objectId()).allow(null)
  start_at: @date().allow(null)
  end_at: @date().allow(null)
).call Joi

querySchema = (->
  q: @string()
  limit: @number()
  offset: @number()
).call Joi

#
# Retrieval
#
@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) } else { slug: id }
  db.verticals.findOne query, callback

@where = (input, callback) ->
  Joi.validate input, querySchema, (err, input) =>
    return callback err if err
    query = {}
    query.title = { $regex: ///#{input.q}///i } if input.q
    cursor = db.verticals
      .find(query)
      .limit(input.limit or 10)
      .skip(input.offset or 0)
    async.parallel [
      (cb) -> cursor.toArray cb
      (cb) -> cursor.count cb
      (cb) -> db.verticals.count cb
    ], (err, [verticals, count, total]) =>
      callback err, {
        total: total
        count: count
        results: verticals.map(@present)
      }

#
# Persistence
#
@save = (input, callback) ->
  Joi.validate input, schema, (err, input) =>
    return callback err if err
    db.verticals.save _.extend(_.omit(input, 'id'),
      _id: ObjectId(input.id)
      # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
      featured_article_ids: input.featured_article_ids.map(ObjectId) if input.featured_article_ids
    ), callback


#
# JSON views
#
@present = (vertical) =>
  _.extend
    id: vertical?._id?.toString()
  , _.omit(vertical, '_id')

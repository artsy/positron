#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "sections" resource.
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
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) } else { slug: id }
  db.sections.findOne query, callback

@where = (input, callback) ->
  Joi.validate input, querySchema, (err, input) =>
    return callback err if err
    query = _.omit input, 'q', 'limit', 'offset'
    query.title = { $regex: ///#{input.q}///i } if input.q
    cursor = db.sections
      .find(query)
      .limit(input.limit)
      .sort($natural: -1)
      .skip(input.offset or 0)
    async.parallel [
      (cb) -> cursor.toArray cb
      (cb) -> cursor.count cb
      (cb) -> db.sections.count cb
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
      _id: ObjectId(input.id)
      # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
      featured_article_ids: input.featured_article_ids.map(ObjectId) if input.featured_article_ids
    db.sections.save data, callback

@destroy = (id, callback) ->
  db.sections.remove { _id: ObjectId(id) }, callback

#
# JSON views
#
@present = (section) =>
  _.extend
    id: section?._id?.toString()
  , _.omit(section, '_id')

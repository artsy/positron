#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "brand-partners" resource.
#

_ = require 'underscore'
db = require '../../lib/db'
async = require 'async'
Joi = require 'joi'
Joi.objectId = require 'joi-objectid'
{ ObjectId } = require 'mongojs'
{ ARTSY_URL, API_MAX, API_PAGE_SIZE } = process.env

#
# Schemas
#
schema = (->
  id: @objectId()
  partner_id: @objectId()
  slug: @string().allow('', null)
  featured_links: @array().items([
    @object().keys
      thumbnail_url: @string().allow('', null)
      headline: @string().allow('', null)
      subheadline: @string().allow('', null)
      description: @string().allow('',null)
  ]).allow(null)
).call Joi

querySchema = (->
  limit: @number().max(Number API_MAX).default(Number API_PAGE_SIZE)
  offset: @number()
  partner_id: @string()
).call Joi

#
# Retrieval
#
@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) } else { slug: id }
  db.brandPartners.findOne query, callback

@where = (input, callback) ->
  Joi.validate input, querySchema, (err, input) =>
    return callback err if err
    query = _.omit input, 'limit', 'offset'
    cursor = db.brandPartners
      .find(query)
      .limit(input.limit)
      .sort($natural: -1)
      .skip(input.offset)
    async.parallel [
      (cb) -> cursor.toArray cb
      (cb) -> cursor.count cb
      (cb) -> db.brandPartners.count cb
    ], (err, [brandPartners, count, total]) =>
      callback err, {
        total: total
        count: count
        results: brandPartners.map(@present)
      }

#
# Persistence
#
@save = (input, callback) ->
  Joi.validate input, schema, (err, input) =>
    return callback err if err
    data = _.extend _.omit(input, 'id'),
      _id: ObjectId(input.id)
    db.brandPartners.save data, callback

@destroy = (id, callback) ->
  db.brandPartners.remove { _id: ObjectId(id) }, callback

#
# JSON views
#
@present = (brandPartner) =>
  _.extend
    id: brandPartner?._id?.toString()
  , _.omit(brandPartner, '_id')

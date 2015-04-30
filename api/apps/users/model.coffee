#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "users" resource.
#

_ = require 'underscore'
async = require 'async'
db = require '../../lib/db'
request = require 'superagent'
Joi = require 'joi'
debug = require('debug') 'api'
async = require 'async'
bcrypt = require 'bcrypt'
{ ObjectId } = require 'mongojs'
{ ARTSY_URL, SALT } = process.env
{ imageUrlsFor } = require '../../lib/artsy_model'

#
# Retrieval
#
@fromAccessToken = (accessToken, callback) ->
  # Find via access token from DB if they exist
  bcrypt.hash accessToken, SALT, (err, encryptedAccessToken) ->
    return callback err if err
    db.users.findOne { access_token: encryptedAccessToken }, (err, user) ->
      return callback err if err
      return callback null, user if user
      # Otherwise fetch data from Gravity and flatten it into a Positron user
      async.parallel [
        (cb) ->
          request.get("#{ARTSY_URL}/api/v1/me")
            .set('X-Access-Token': accessToken).end cb
        (cb) ->
          request.get("#{ARTSY_URL}/api/v1/me/partners")
            .set('X-Access-Token': accessToken).end cb
      ], (err, results) ->
        return callback err if err
        user = results[0].body
        partnerIds = _.pluck results[1].body, '_id'
        request
          .get("#{ARTSY_URL}/api/v1/profile/#{user.default_profile_id}")
          .set('X-Access-Token': accessToken).end (err, res) ->
            return callback err if err
            profile = res.body
            db.users.save {
              _id: ObjectId(user.id)
              name: user.name
              type: user.type
              access_to_partner_ids: partnerIds
              profile_handle: profile.id
              profile_id: profile._id
              profile_icon_url: _.first(_.values(profile.icon?.image_urls))
              access_token: encryptedAccessToken
            }, callback

#
# JSON views
#
@present = (data) =>
  _.extend data,
    id: data._id?.toString()
    _id: undefined
    access_token: undefined

#
# Helpers
#
@denormalizedForArticle = denormalizedForArticle = (user) ->
  _.pick user, 'id', 'name', 'profile_id', 'profile_handle'

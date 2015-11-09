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

#
# Retrieval
#
@find = (id, callback) ->
  db.users.findOne { _id: ObjectId(id) }, callback

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
      ], (err, results) ->
        return callback err if err
        user = results[0].body
        save user, accessToken, callback

#
# Persistance
#
@findOrInsert = (id, accessToken, callback) ->
  return callback() unless id?
  db.users.findOne { _id: ObjectId(id) }, (err, user) ->
    return callback err if err
    return callback null, user if user
    async.parallel [
      (cb) ->
        request.get("#{ARTSY_URL}/api/v1/user/#{id}")
          .set('X-Access-Token': accessToken).end cb
      (cb) ->
        request.get("#{ARTSY_URL}/api/v1/user/#{id}/access_controls")
          .set('X-Access-Token': accessToken).end cb
    ], (err, results) ->
      return callback err if err
      user = results[0].body
      save user, accessToken, callback

save = (user, accessToken, callback) ->
  async.parallel _.compact([
    (cb) ->
      bcrypt.hash accessToken, SALT, cb
    (cb) ->
      request
        .get("#{ARTSY_URL}/api/v1/profile/#{user.default_profile_id}")
        .set('X-Access-Token': accessToken).end cb
    if user.type is "Admin"
      (cb) ->
        request
        .get("#{ARTSY_URL}/api/v1/me/authentications")
        .set('X-Access-Token': accessToken).end cb
  ]), (err, results) ->
    return callback err if err
    encryptedAccessToken = results[0]
    profile = results[1].body
    db.users.save {
      _id: ObjectId(user.id)
      name: user.name
      email: user.email
      type: user.type
      profile_handle: profile.id
      profile_id: profile._id
      profile_icon_url: _.first(_.values(profile.icon?.image_urls))
      access_token: encryptedAccessToken
      facebook_uid: results[2]?.body[0]?.uid
      twitter_uid: results[2]?.body[1]?.uid
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
@denormalizedForArticle = (user) ->
  {
    id: user._id
    name: user.name
    profile_id: user.profile_id
    profile_handle: user.profile_handle
    facebook_uid: user.facebook_uid
    twitter_uid: user.twitter_uid
  }

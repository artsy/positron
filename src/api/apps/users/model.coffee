#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "users" resource.
#

_ = require 'underscore'
async = require 'async'
db = require '../../lib/db'
request = require 'superagent'
async = require 'async'
bcrypt = require 'bcryptjs'
{ ObjectId } = require 'mongojs'
{ ARTSY_URL, SALT, API_URL } = process.env
jwtDecode = require 'jwt-decode'

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
      if user
        savedPartnerIds = user.partner_ids #TO STRING THIS TO COMPARE
        latestPartnerIds = jwtDecode(accessToken)?.partner_ids or []
        console.log(jwtDecode(accessToken))
        console.log(savedPartnerIds)
        console.log(latestPartnerIds)
        return callback null, user if savedPartnerIds is latestPartnerIds
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
@refresh = (accessToken, callback) ->
  request.get("#{ARTSY_URL}/api/v1/me")
    .set('X-Access-Token': accessToken)
    .end (err, user) ->
      return callback err if err
      save user.body, accessToken, callback

save = (user, accessToken, callback) ->
  async.parallel [
    (cb) ->
      db.channels.find {user_ids: ObjectId(user.id)}, cb
    (cb) ->
      bcrypt.hash accessToken, SALT, cb
  ], (err, results) ->
    return callback err if err
    partner_ids = jwtDecode(accessToken)?.partner_ids or []
    user.partner_ids = _.map partner_ids, ObjectId
    user.channel_ids = _.pluck results[0], '_id'
    encryptedAccessToken = results[1]
    db.users.save {
      _id: ObjectId(user.id)
      name: user.name
      email: user.email
      type: user.type
      access_token: encryptedAccessToken
      partner_ids: user.partner_ids
      channel_ids: user.channel_ids
    }, callback

#
# Utility
#
@hasChannelAccess = (user, channel_id) ->
  return false unless user

  channel_id = channel_id.toString() if channel_id
  @channels = _.find user.channel_ids, (id) ->
    id.toString() is channel_id
  @partners = _.find user.partner_ids, (id) ->
    id.toString() is channel_id

  return true if @channels
  return @partners? or user.type is 'Admin'

#
# JSON views
#
@present = (data) =>
  _.extend data,
    id: data?._id?.toString()
    _id: undefined
    access_token: undefined

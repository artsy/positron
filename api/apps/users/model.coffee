#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "users" resource.
#

_ = require 'underscore'
async = require 'async'
db = require '../../lib/db'
request = require 'superagent'
{ ObjectId } = require 'mongojs'
{ ARTSY_URL } = process.env

# Retrieval

@fromAccessToken = (accessToken, callback) ->

  # See if the user's already saved in the db
  db.users.findOne { access_token: accessToken }, (err, user) ->
    return callback err if err
    return callback null, user if user

    # If not, fetch the current user from Artsy's API
    request
      .get("#{ARTSY_URL}/api/current_user")
      .set('X-Access-Token': accessToken)
      .end (err, res) ->
        return callback err if err
        return callback res.body unless res.body.id?
        user = res.body

        async.parallel [
          (cb) ->
            request
              .get(user._links.profile.href)
              .set('X-Access-Token': accessToken)
              .end (err, res) -> cb err, res?.body
          (cb) ->
            request
              .get(user._links.user_details.href)
              .set('X-Access-Token': accessToken)
              .end (err, res) -> cb err, res?.body
        ], (err, results) ->

          # Flatten the various user datas and clean out HAL properties
          user._id = ObjectId user.id
          user.access_token = accessToken
          user.profile = results[0]
          user.details = results[1]
          user.profile.icon_url = user.profile._links.thumbnail.href
          delete user.profile._links
          delete user.details._links
          delete user._links

          # Save the merged user data in the database
          db.users.update { id: user.id }, user, { upsert: true }, (err, res) ->
            return callback err if err
            callback null, user

# Persistence

@destroyFromAccessToken = (accessToken, callback) ->
  db.users.findOne { access_token: accessToken }, (err, user) ->
    return callback err if err
    db.users.remove { access_token: accessToken }, (err, res) ->
      callback err, user

# JSON views

@present = (data) =>
  _.extend data,
    id: data._id?.toString()
    _id: undefined
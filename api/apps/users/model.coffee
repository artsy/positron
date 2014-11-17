#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "users" resource.
#

_ = require 'underscore'
async = require 'async'
db = require '../../lib/db'
request = require 'superagent'
{ ObjectId } = require 'mongojs'
{ GRAVITY_URL } = process.env

# Retrieval

@fromAccessToken = (accessToken, callback) ->

  # See if the user's already saved in the db
  db.users.findOne { access_token: accessToken }, (err, user) ->
    return callback err if err
    return callback null, user if user

    # If not, fetch the current user from Artsy's API
    request
      .get("#{GRAVITY_URL}/api/current_user")
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

          # Aggregate the various user datas
          user._id = ObjectId user.id
          user.access_token = accessToken
          user.profile = results[0]
          user.details = results[1]

          # Piece together the profile icon url
          curie = (c for c in user.profile._links.curies when c.name is 'image')[0]
          ext = _.last user.profile._links['image:self'].href.split('.')
          user.icon_url = curie.href.replace('{rel}',
            user.profile.image_versions[0] + '.' + ext)

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
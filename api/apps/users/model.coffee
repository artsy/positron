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
{ ObjectId } = require 'mongojs'
{ ARTSY_URL } = process.env
{ imageUrlsFor } = require '../../lib/artsy_model'

querySchema = (->
  q: @string()
  limit: @number()
  offset: @number()
).call Joi

#
# Retrieval
#
@fromAccessToken = (accessToken, callback) ->
  db.users.findOne { access_token: accessToken }, (err, user) ->
    return callback err if err
    return callback null, user if user?.details?
    upsertWithGravityData { accessToken: accessToken }, callback

@find = find = (id, callback) ->
  db.users.findOne { _id: ObjectId(id) }, callback

@where = (input, callback) ->
  Joi.validate input, querySchema, (err, input) =>
    return callback err if err
    query = {}
    if input.q
      query.$or = [
        { 'user.name': $regex: ///#{input.q}///i }
        { 'details.email': $regex: ///#{input.q}///i }
      ]
    cursor = db.users
      .find(query)
      .limit(input.limit or 10)
      .skip(input.offset or 0)
    async.parallel [
      (cb) -> cursor.toArray cb
      (cb) -> cursor.count cb
      (cb) -> db.users.count cb
    ], (err, [users, count, total]) =>
      callback err, {
        total: total
        count: count
        results: (@present user for user in users)
      }

#
# JSON views
#
@present = (data) =>
  _.extend data,
    id: data._id?.toString()
    _id: undefined

#
# Helpers
#
@denormalizedForArticle = denormalizedForArticle = (user) ->
  id: user._id
  name: user.user?.name
  profile_id: user.profile?.id
  profile_handle: user.profile?.handle

@upsertWithGravityData = upsertWithGravityData = (options, callback) ->

  # Determine who we're fetching with what authorization
  if options.id
    url = "#{ARTSY_URL}/api/users/#{options.id}"
  else
    url = "#{ARTSY_URL}/api/current_user"
  if options.xappToken
    headers = 'X-Xapp-Token': options.xappToken
  else
    headers = 'X-Access-Token': options.accessToken

  # Initial user fetch
  request.get(url).set(headers).end (err, res) ->
    return callback err if err
    return callback res.body unless res.body.id?
    user = res.body

    # Fetch the profile & details
    async.parallel [
      (cb) ->
        request
          .get(user._links.profile.href)
          .set(headers)
          .end (err, res) -> cb err, res?.body
      (cb) ->
        request
          .get(user._links.user_details.href)
          .set(headers)
          .end (err, res) -> cb err, res?.body
    ], (err, results) ->
      return callback err if err

      # Aggregate the various user datas
      profile = results[0] if results[0].handle
      details = results[1] if results[1].type
      newUser = {
        _id: ObjectId(user.id)
        user: user
        profile: profile
        details: details
        access_token: options.accessToken
        icon_urls: imageUrlsFor(profile)
      }

      # Save the merged user data in the database
      db.users.update(
        { _id: newUser._id }
        newUser
        { upsert: true }
        (err, res) -> callback err, newUser
      )

      # Denormalize user's data into articles they authored in the background
      db.articles.update(
        { author_id: newUser._id }
        { $set: author: denormalizedForArticle(newUser) }
        (err) -> debug err if err
      )
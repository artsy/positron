_  = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class User extends Backbone.Model

  urlRoot: "#{sd.API_URL}/users"

  isEditorialTeam: ->
    (@get('type') is 'Admin' and
      @get('email')?.split('@')[0] in sd.EDITORIAL_TEAM?.split(',')) or
        @get('email') is sd.EDITORIAL_EMAIL

  isAdmin: ->
    @get('type') is 'Admin'

  resave: ->
    console.log 'resaving the user'
    @fetch
      data: resave: true
      success: (user) ->
        console.log user

  isOutdated: (callback) ->
    callback true

    # for attr in ['id', 'type', 'name', 'email', 'channel_ids', 'partner_ids']
    # callback true if not _.isEqual data[attr], sd.USER[attr]
    # async.parallel [
    #   (cb) ->
    #     request.get("#{ARTSY_URL}/api/v1/user/#{@get('id')}/access_controls")
    #       .set('X-Access-Token': accessToken).end cb
    #   (cb) ->
    #     request.get("#{API_URL}/api/channels?user_id=#{@get('id')}")
    #       .set('X-Access-Token': accessToken).end cb
    #   (cb) ->
    #     request.get("#{ARTSY_URL}/api/v1/user/#{@get('id')}")
    #       .set('X-Access-Token': accessToken).end cb
    # ], (err, results) ->
    #   return callback true if err
    #   partner_ids = _.map results[0].body, (partner) ->
    #     partner.property._id
    #   channel_ids = _.pluck results[1], '_id'
    #   name = results[2].get('name')
    #   if @get('partner_ids') 
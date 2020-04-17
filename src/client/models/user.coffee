_  = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
async = require 'async'
request = require 'superagent'
jwtDecode = require 'jwt-decode'

module.exports = class User extends Backbone.Model

  urlRoot: "#{sd.API_URL}/users/me"

  isAdmin: ->
    roles = @get('roles') or []

    'team' in roles

  refresh: (cb) ->
    request.get("#{sd.API_URL}/users/me/refresh")
      .set('X-Access-Token': @get('access_token'))
      .end (err, res) ->
        cb()

  hasChannel: (id) ->
    _.contains @get('channel_ids'), id

  hasPartner: (id) ->
    @isAdmin() or _.contains @get('partner_ids'), id

  hasArticleAccess: (article) ->
    if article.get('channel_id')
      @hasChannel article.get('channel_id')
    else
      @hasPartner article.get('partner_channel_id')

  isOutdated: (callback) ->
    async.waterfall [
      (cb) =>
        request.get("#{sd.ARTSY_URL}/api/v1/me")
          .set('X-Access-Token': @get('access_token'))
          .end (err, result) ->
            cb null, result?.body
      (user, cb) =>
        request.get("#{sd.API_URL}/channels?user_id=#{@get('id')}&limit=50")
          .set('X-Access-Token': @get('access_token'))
          .end (err, results) ->
            cb null, [ user, results?.body?.results ]
    ], (err, results) =>
      return callback true if err
      user = results[0]
      user.partner_ids = jwtDecode(@get('access_token')).partner_ids
      user.channel_ids = _.pluck results[1], 'id'

      for attr in ['id', 'type', 'name', 'email']
        return callback true unless _.isEqual user[attr], @get(attr)
      for attr in ['channel_ids', 'partner_ids']
        return callback true unless _.isEqual(
          _.clone(user[attr]).sort(),
          _.clone(@get(attr)).sort()
        )
      callback false

  fetchPartners: (cb) ->
    return cb [] unless @get('partner_ids')?.length > 0
    request
      .get("#{sd.ARTSY_URL}/api/v1/me/partners")
      .set('X-Access-Token': @get('access_token'))
      .end (err, results) ->
        return cb [] if err
        cb results.body

#
# Allows a person with the correct permissions to access other channels
#

_ = require 'underscore'
express = require 'express'
request = require 'superagent'
sd = require('sharify').data
User = require '../../models/user.coffee'
Channel = require '../../models/channel.coffee'

app = module.exports = express()

app.get '/switch_channel/:id', switchChannel = (req, res, next) ->
  return next() unless _.contains(req.user.get('channel_ids'), req.params.id) or
    _.contains(req.user.get('partner_ids'), req.params.id) or
    req.user.get('type') is 'Admin'
  console.log 'switch channel fetch'
  new Channel(id: req.params.id).fetchChannelOrPartner
    success: (channel) ->
      channel = new Channel channel
      req.user.set 'current_channel', channel.denormalized()
      req.login req.user, (err) ->
        return next err if err
        res.redirect req.query['redirect-to'] or '/'
    error: (err) ->
      return next err

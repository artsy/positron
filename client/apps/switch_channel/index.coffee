#
# Allows a person with the correct permissions to access other channels
#

_ = require 'underscore'
express = require 'express'
request = require 'superagent'
sd = require('sharify').data
Channel = require '../../models/channel.coffee'

app = module.exports = express()

app.get '/switch_channel/:id', switchChannel = (req, res, next) ->
  new Channel(id: req.params.id).fetchChannelOrPartner
    success: (channel) =>

      # Make sure user has access to channel or partner
      if channel.get('type') is 'partner'
        return next() unless req.user.hasPartner channel.get('id')
      else
        return next() unless req.user.hasChannel channel.get('id')

      # Set the current channel and login
      req.user.set 'current_channel', channel.denormalized()
      req.login req.user, (err) ->
        return next err if err
        res.redirect req.query['redirect-to'] or '/'
    error: (err) ->
      return next err

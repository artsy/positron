#
# Allows a person with the correct permissions to access other channels
#

express = require 'express'
request = require 'superagent'
sd = require('sharify').data
User = require '../../models/user.coffee'
Channel = require '../../models/channel.coffee'

app = module.exports = express()

app.get '/switch_channel/:id', switchChannel = (req, res, next) ->
  return next() unless req.user?.get('channel_ids')?.includes(req.params.id) or
    req.user?.get('partner_ids')?.includes(req.params.id)
  new Channel(id: req.params.id).fetchChannelOrPartner
    success: (channel) ->
      # login?
      req.user.set 'current_channel', channel.denormalized()
      res.redirect '/'
    error: (err) ->
      return next err

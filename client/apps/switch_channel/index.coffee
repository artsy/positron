#
# Allows a person with the correct permissions to access other channels
#

express = require 'express'
request = require 'superagent'
sd = require('sharify').data
User = require '../../models/user.coffee'

app = module.exports = express()

app.get '/switch_channel/:id', switchChannel = (req, res, next) ->
  return next() unless req.user?.get('channel_ids')?.includes(req.params.id) or
    req.user?.get('partner_ids')?.includes(req.params.id)

  # Move this fetch to the channel model??
  # request
  #   .get("#{sd.API_URL}/channels/#{req.params.id}")
  #   .set('X-Access-Token', req.user.get 'access_token')
  #   .end (err, sres) ->
  #     return next err if err
  #     user = new User(sres.body)
  #     user.set type: 'Admin'
  #     user.set access_token: req.user.get 'access_token'
  #     req.login user, (err) ->
  #       return next err if err
  #       res.redirect req.query['redirect-to'] or '/'
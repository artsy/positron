#
# Allows an admin to log in as another user
#

express = require 'express'
request = require 'superagent'
sd = require('sharify').data
User = require '../../models/user.coffee'

app = module.exports = express()

app.get '/impersonate/:id', impersonate = (req, res, next) ->
  return next() unless req.user?.get('type') is 'Admin'
  request
    .get("#{sd.API_URL}/users/#{req.params.id}")
    .set('X-Access-Token', req.user.get 'access_token')
    .end (err, sres) ->
      return next err if err
      user = new User(sres.body)
      user.set type: 'Admin'
      user.set access_token: req.user.get 'access_token'
      req.login user, (err) ->
        return next err if err
        res.redirect req.query['redirect-to'] or '/'
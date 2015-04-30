#
# Allows an admin to log in as another user
#

_ = require 'underscore'
express = require 'express'
request = require 'superagent'
sd = require('sharify').data
User = require '../../models/user.coffee'
debug = require('debug') 'client'
fs = require 'fs'
jade = require 'jade'

render = (req, res, locals) ->
  res.send jade.compile(
    fs.readFileSync(f = __dirname + '/index.jade'),
    filename: f
    cache: true
  ) _.extend res.locals, locals, referrer: req.get('referrer')

module.exports = (app) ->
  app.set 'views', __dirname
  app.set 'view engine', 'jade'
  app.get '*', (req, res, next) ->
    err = new Error "Page Not Found"
    err.status = 404
    render req, res, err: err
  app.use (err, req, res, next) ->
    debug err.stack, err.message
    if err.message.match 'access token is invalid or has expired'
      return res.redirect '/logout'
    render req, res, err: err

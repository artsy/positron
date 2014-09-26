#
# Sets up intial project settings, middleware, mounted apps, and
# global configuration such as overriding Backbone.sync and
# populating sharify data
#

express = require 'express'
session = require 'cookie-session'
bodyParser = require 'body-parser'
cookieParser = require 'cookie-parser'
session = require 'cookie-session'
Backbone = require 'backbone'
sharify = require 'sharify'
path = require 'path'
fs = require 'fs'
helperMiddleware = require '../helper_middleware'
setupEnv = require './env'
setupAuth = require './auth'

module.exports = (app) ->

  # Override Backbone to use server-side sync
  Backbone.sync = require 'backbone-super-sync'
  Backbone.sync.editRequest = (req) ->
    req.query 'token': process.env.SPOOKY_TOKEN

  # Mount generic middleware & run setup modules
  setupEnv app
  app.use sharify
  app.use cookieParser()
  app.use bodyParser.json()
  app.use bodyParser.urlencoded()
  app.use session secret: process.env.SESSION_SECRET
  setupAuth app
  app.use helperMiddleware

  # Mount apps
  app.use '/', require '../../apps/article_list'
  # TODO: Replace with proper app that renders errors
  app.use (err, req, res, next) ->
    console.log err
    res.status(err.status).send err.toString()

  # Mount static middleware for sub apps, components, and project-wide
  fs.readdirSync(path.resolve __dirname, '../../apps').forEach (fld) ->
    app.use express.static(path.resolve __dirname, "../../apps/#{fld}/public")
  fs.readdirSync(path.resolve __dirname, '../../components').forEach (fld) ->
    app.use express.static(path.resolve __dirname, "../../components/#{fld}/public")
  app.use express.static(path.resolve __dirname, '../../public')
#
# Sets up intial project settings, middleware, mounted apps, and
# global configuration such as overriding Backbone.sync and
# populating sharify data
#

# Dependencies
require './sharify'
sharify = require 'sharify'
bucketAssets = require 'bucket-assets'
express = require 'express'
session = require 'cookie-session'
bodyParser = require 'body-parser'
cookieParser = require 'cookie-parser'
session = require 'cookie-session'
Backbone = require 'backbone'
path = require 'path'
fs = require 'fs'
forceSSL = require 'express-force-ssl'
setupEnv = require './env'
setupAuth = require './auth'
morgan = require 'morgan'
{ locals, errorHandler, helpers, ua } = require '../middleware'
{ parse } = require 'url'
{ NODE_ENV } = process.env

module.exports = (app) ->

  # Override Backbone to use server-side sync
  Backbone.sync = require 'backbone-super-sync'

  # Route to ping for system up
  app.get '/system/up', (req, res) ->
    res.send 200, { nodejs: true }

  # Mount generic middleware & run setup modules
  if 'production' is NODE_ENV or 'staging' is NODE_ENV
    app.set('forceSSLOptions', { trustXFPHeader: true }).use forceSSL
  app.use sharify
  setupEnv app
  app.use cookieParser()
  app.use bodyParser.json limit:'5mb'
  app.use bodyParser.urlencoded limit:'5mb'
  app.use morgan 'dev'
  app.use session
    secret: process.env.SESSION_SECRET
    key: 'positron.sess'
  app.use bucketAssets()
  setupAuth app
  app.use locals
  app.use helpers
  app.use ua

  # Mount apps
  app.use require '../../apps/sections'
  app.use require '../../apps/article_list'
  app.use require '../../apps/edit'
  app.use require '../../apps/impersonate'
  app.use require '../../apps/links'

  # Mount static middleware for sub apps, components, and project-wide
  fs.readdirSync(path.resolve __dirname, '../../apps').forEach (fld) ->
    app.use express.static(path.resolve __dirname, "../../apps/#{fld}/public")
  fs.readdirSync(path.resolve __dirname, '../../components').forEach (fld) ->
    app.use express.static(path.resolve __dirname, "../../components/#{fld}/public")
  app.use express.static(path.resolve __dirname, '../../public')

  # Error handler
  require('../../components/error/server') app

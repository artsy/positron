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
{ locals, errorHandler, helpers, ua, sameOrigin } = require '../middleware'
{ parse } = require 'url'
{ NODE_ENV, SESSION_SECRET } = process.env

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
  app.use bodyParser.json limit:'5mb', extended: true
  app.use bodyParser.urlencoded limit:'5mb', extended: true
  app.use morgan(if NODE_ENV is 'development' then 'dev' else 'combined')
  app.use session
    secret: SESSION_SECRET
    key: 'positron.sess'
  app.use bucketAssets()
  setupAuth app
  app.use locals
  app.use helpers
  app.use ua
  app.use sameOrigin

  # Mount apps
  app.use require '../../apps/edit'
  app.use require '../../apps/settings'
  app.use require '../../apps/switch_channel'
  app.use require '../../apps/queue'
  app.use require '../../apps/articles_list'

  # Mount static middleware for sub apps, components, and project-wide
  fs.readdirSync(path.resolve __dirname, '../../apps').forEach (fld) ->
    app.use express.static(path.resolve __dirname, "../../apps/#{fld}/public")
  fs.readdirSync(path.resolve __dirname, '../../components').forEach (fld) ->
    app.use express.static(path.resolve __dirname, "../../components/#{fld}/public")
  app.use express.static(path.resolve __dirname, '../../public')

  # Error handler
  require('../../components/error/server') app

#
# Sets up intial project settings, middleware, mounted apps, and
# global configuration such as overriding Backbone.sync and
# populating sharify data
#

# Inject some configuration & constant data into sharify
sharify = require 'sharify'
sd = sharify.data =
  APP_URL: process.env.APP_URL
  API_URL: process.env.API_URL
  NODE_ENV: process.env.NODE_ENV
  SPOOKY_URL: process.env.SPOOKY_URL
  FORCE_URL: process.env.FORCE_URL
  ARTSY_URL: process.env.ARTSY_URL

# Dependencies
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
{ locals, errorHandler } = require '../middleware'
{ parse } = require 'url'

module.exports = (app) ->

  # Override Backbone to use server-side sync
  Backbone.sync = require 'backbone-super-sync'

  # Mount generic middleware & run setup modules
  app.use forceSSL if 'production' is sd.NODE_ENV
  setupEnv app
  app.use sharify
  app.use cookieParser()
  app.use bodyParser.json()
  app.use bodyParser.urlencoded()
  app.use morgan 'dev'
  app.use session
    secret: process.env.SESSION_SECRET
    key: 'positron.sess'
  setupAuth app
  app.use locals

  # Mount apps
  app.use '/', require '../../apps/article_list'
  app.use '/', require '../../apps/edit'
  app.use errorHandler

  # Mount static middleware for sub apps, components, and project-wide
  fs.readdirSync(path.resolve __dirname, '../../apps').forEach (fld) ->
    app.use express.static(path.resolve __dirname, "../../apps/#{fld}/public")
  fs.readdirSync(path.resolve __dirname, '../../components').forEach (fld) ->
    app.use express.static(path.resolve __dirname, "../../components/#{fld}/public")
  app.use express.static(path.resolve __dirname, '../../public')
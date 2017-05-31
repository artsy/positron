require('node-env-file')("#{process.cwd()}/.env") unless process.env.NODE_ENV?
express = require "express"
bodyParser = require 'body-parser'
logger = require 'artsy-morgan'
{ helpers, notFound, errorHandler } = require './lib/middleware'
{ NODE_ENV,
  ARTSY_URL,
  ARTSY_ID,
  ARTSY_SECRET,
  SENTRY_PRIVATE_DSN } = process.env
debug = require('debug') 'api'
cors = require 'cors'
RavenServer = require 'raven'

app = module.exports = express()

# Error Reporting
if SENTRY_PRIVATE_DSN
  RavenServer.config(SENTRY_PRIVATE_DSN).install()
  app.use RavenServer.requestHandler()

# Middleware
app.use cors()
app.use helpers
app.use bodyParser.json limit:'5mb', extended: true
app.use bodyParser.urlencoded limit:'5mb', extended: true
app.use logger

# Apps
app.use '/__gravity', require('antigravity').server if NODE_ENV is 'test'
app.use require './apps/articles'
app.use require './apps/sections'
app.use require './apps/shows'
app.use require './apps/users'
app.use require './apps/curations'
app.use require './apps/channels'
app.use require './apps/tags'
app.use require './apps/verticals'
app.use require './apps/graphql'

if SENTRY_PRIVATE_DSN
  app.use RavenServer.errorHandler()

# Moar middleware
app.use notFound
app.use errorHandler

# Start the test server if run directly
app.listen(5000, -> debug "Listening on 5000") if module is require.main
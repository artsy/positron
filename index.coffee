#
# Main server that combines API & client
#

# Load environment vars
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env __dirname + '/.env.test'
  when 'production', 'staging' then ''
  else env __dirname + '/.env'

# Dependencies
newrelic = require 'artsy-newrelic'
artsyXapp = require 'artsy-xapp'
debug = require('debug') 'app'
raven = require 'raven'
express = require "express"
app = module.exports = express()

# Get an xapp token
artsyXapp.init { url: process.env.ARTSY_URL, id: process.env.ARTSY_ID, secret: process.env.ARTSY_SECRET }, ->

  # Put client/api together
  app.use newrelic
  app.use '/api', require './api'
  # TODO: Possibly a terrible hack to not share `req.user` between both.
  app.use (req, rest, next) -> (req.user = null); next()
  app.use require './client'

  # Start the server and send a message to IPC for the integration test
  # helper to hook into.
  app.listen process.env.PORT, ->
    debug "Listening on port " + process.env.PORT
    process.send? "listening"

# Crash if we can't get/refresh an xapp token
artsyXapp.on 'error', (e) -> console.warn(e); process.exit(1)

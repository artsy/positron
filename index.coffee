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
debug = require('debug') 'app'
raven = require 'raven'
express = require "express"
app = module.exports = express()

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

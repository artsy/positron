fs = require 'fs'
path = require 'path'
env = require 'node-env-file'
env envFile if fs.existsSync envFile = path.resolve __dirname, '../.env'
express = require "express"
bodyParser = require 'body-parser'
morgan = require 'morgan'
{ helpers, notFound, locals, setUser, errorHandler,
  loginRequired } = require './lib/middleware'
{ NODE_ENV } = process.env

app = module.exports = express()

# Middleware
app.use helpers
app.use bodyParser.urlencoded()
app.use bodyParser.json()
app.use morgan 'dev'

# Apps
app.use '/__gravity', require('antigravity').server if NODE_ENV is 'test'
app.use require './apps/users'
app.use require './apps/articles'
app.use require './apps/artworks'
app.use require './apps/artists'

# Moar middleware
app.use errorHandler
app.use notFound

# Start the test server if run directly
app.listen(5000, -> console.log "Listening on 5000") if module is require.main
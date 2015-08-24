require('node-env-file')("#{process.cwd()}/.env") unless process.env.NODE_ENV?
express = require "express"
bodyParser = require 'body-parser'
morgan = require 'morgan'
{ helpers, notFound, errorHandler } = require './lib/middleware'
{ NODE_ENV, ARTSY_URL, ARTSY_ID, ARTSY_SECRET } = process.env
debug = require('debug') 'api'
cors = require 'cors'

app = module.exports = express()

# Middleware
app.use cors()
app.use helpers
app.use bodyParser.urlencoded()
app.use bodyParser.json()
app.use morgan 'dev'

# Apps
app.use '/__gravity', require('antigravity').server if NODE_ENV is 'test'
app.use require './apps/articles'
app.use require './apps/verticals'
app.use require './apps/organizations'
app.use require './apps/shows'
app.use require './apps/users'
app.use require './apps/brand_partners'

# Moar middleware
app.use notFound
app.use errorHandler

# Start the test server if run directly
app.listen(5000, -> debug "Listening on 5000") if module is require.main
require('node-env-file')("#{process.cwd()}/.env") unless process.env.NODE_ENV?
express = require "express"
bodyParser = require 'body-parser'
morgan = require 'morgan'
{ helpers, notFound, locals, setUser, errorHandler,
  loginRequired } = require './lib/middleware'
{ NODE_ENV, ARTSY_URL, ARTSY_ID, ARTSY_SECRET } = process.env
{ authenticated, setUser } = require './apps/users/routes'
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
app.use setUser
app.post '/articles', authenticated
app.put '/articles/:id', authenticated
app.delete '/articles/:id', authenticated
app.use require './apps/articles'
app.use authenticated
app.use require './apps/users'
app.use require './apps/report'

# Moar middleware
app.use errorHandler
app.use notFound

# Start the test server if run directly
app.listen(5000, -> debug "Listening on 5000") if module is require.main
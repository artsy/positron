require('node-env-file')("#{process.cwd()}/.env") unless process.env.NODE_ENV?
express = require "express"
bodyParser = require 'body-parser'
morgan = require 'morgan'
{ helpers, notFound, errorHandler } = require './lib/middleware'
{ NODE_ENV, ARTSY_URL, ARTSY_ID, ARTSY_SECRET } = process.env
{ authenticated, setUser } = require './apps/users/routes'
migrate = require './lib/migrate'
syncUsers = require './lib/sync_users'
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
app.get '/articles', (req, res, next) ->
	if req.query.published is 'true' then next() else setUser(req, res, next)
app.post '/articles', setUser, authenticated
app.put '/articles/:id', setUser, authenticated
app.delete '/articles/:id', setUser, authenticated
app.use require './apps/articles'
app.use setUser, authenticated
app.use require './apps/users'
app.use require './apps/artworks'
app.use require './apps/artists'
app.use require './apps/report'

# Webhook for tasks for debugging purpose (to be removed)
app.get '/task/:task', (req, res, next) ->
  return res.err 401, 'Admin only.' unless req.user?.details?.type is 'Admin'
  switch req.params.task
    when 'migrate' then migrate debug
    when 'sync-users' then syncUsers debug
  res.send { success: "Running #{req.params.task}... check the logs." }

# Moar middleware
app.use errorHandler
app.use notFound

# Start the test server if run directly
app.listen(5000, -> debug "Listening on 5000") if module is require.main
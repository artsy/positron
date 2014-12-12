require('node-env-file')("#{process.cwd()}/.env") unless process.env.NODE_ENV?
express = require "express"
bodyParser = require 'body-parser'
morgan = require 'morgan'
{ helpers, notFound, locals, setUser, errorHandler,
  loginRequired } = require './lib/middleware'
{ NODE_ENV, ARTSY_URL, ARTSY_ID, ARTSY_SECRET } = process.env
{ authenticated, setUser } = require './apps/users/routes'
migratePosts = require './lib/migrate_posts'
syncUsers = require './lib/sync_users'
debug = require('debug') 'api'
{ CronJob } = require 'cron'

app = module.exports = express()

# Middleware
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
app.use require './apps/artworks'
app.use require './apps/artists'

# Webhook for tasks for debugging purpose (to be removed)
app.get '/task/:task', (req, res, next) ->
  return res.err 401, 'Admin only.' unless req.user?.details?.type is 'Admin'
  switch req.params.task
    when 'migrate-posts' then migratePosts()
    when 'sync-users' then syncUsers()
  res.send { success: "Running #{req.params.task}... check the logs." }

# Moar middleware
app.use errorHandler
app.use notFound

# Start cron jobs
new CronJob '0 */4 * * *', migratePosts, null, true
new CronJob '0 24 * * *', syncUsers, null, true

# Start the test server if run directly
app.listen(5000, -> debug "Listening on 5000") if module is require.main
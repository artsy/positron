require('node-env-file')("#{process.cwd()}/.env") unless process.env.NODE_ENV?
express = require "express"
bodyParser = require 'body-parser'
morgan = require 'morgan'
chalk = require 'chalk'
{ helpers, notFound, errorHandler } = require './lib/middleware'
{ NODE_ENV, ARTSY_URL, ARTSY_ID, ARTSY_SECRET } = process.env
debug = require('debug') 'api'
cors = require 'cors'

app = module.exports = express()

# Middleware
app.use cors()
app.use helpers
app.use bodyParser.json limit:'5mb', extended: true
app.use bodyParser.urlencoded limit:'5mb', extended: true

app.use morgan if NODE_ENV is 'development' then 'dev' else (tokens, req, res) ->
  status = tokens.status(req, res)
  chalk.yellow('API:') +
    ' ' + chalk.blue(tokens.method(req, res)) +
    ' ' + (
            if status >= 500
              chalk.red(tokens.url(req, res)) + ' ' + chalk.red(status)
            else if status >= 400
              chalk.yellow(tokens.url(req, res)) + ' ' + chalk.yellow(status)
            else
              chalk.green(tokens.url(req, res)) + ' ' + chalk.green(status)
          ) +
    ' ' + chalk.cyan(tokens['response-time'](req, res) + 'ms') +
    ' ' + chalk.white(tokens['remote-addr'](req, res)) +
    ' "' + chalk.white(tokens['user-agent'](req, res)) + '"'

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

# Moar middleware
app.use notFound
app.use errorHandler

# Start the test server if run directly
app.listen(5000, -> debug "Listening on 5000") if module is require.main
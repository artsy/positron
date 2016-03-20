#
# Generic api-wide middleware. As this grows we'll want to break it up into
# sub-modules in /lib/middleware, etc.
#

_ = require 'underscore'
{ parse } = require 'url'
{ API_URL } = process.env
debug = require('debug') 'api'

@helpers = (req, res, next) ->
  # Error handler helper for predictable JSON responses.
  res.err = (status, message) ->
    err = new Error message or "Internal Error"
    err.status = status or 500
    next err
  # Allow access token in header or query param
  req.accessToken = req.get('X-Access-Token') or req.query.access_token
  next()

@notFound = (req, res, next) ->
  res.err 404, "Endpoint does not exist."

@errorHandler = (err, req, res, next) ->
  debug err.stack
  status = err.status or if err.name is 'ValidationError' then 403 else 500
  msg = (err.message or err.stack or err.toString())
  res.status(status).send { status: status, message: msg }
  # TODO: Sporadically our Compose Mongo "pool dies". We have filed a ticket.
  # Until then, we know restarting the app fixes this issue. See Slack thread
  # https://artsy.slack.com/archives/web/p1458490282000103
  if err.name is 'MongoError' and
  msg.match(/connection to host (.*) was destroyed/)
    process.exit(1)

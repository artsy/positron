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
  res.status(status = err.status or 500).send {
    status: status,
    message: (err.message or err.stack or err.toString())
  }

#
# Generic api-wide middleware. As this grows we'll want to break it up into
# sub-modules in /lib/middleware, etc.
#

_ = require 'underscore'
{ parse } = require 'url'
{ API_URL } = process.env
debug = require('debug') 'api'

UNKNOWN_ERROR = "Unknown failure. " +
                "Try again or contact support@artsymail.com for help."

@helpers = (req, res, next) ->

  # Error handler helper for predictable JSON responses.
  res.err = (status, message) ->
    err =
      status: s = status or 500
      message: message or "Internal Error"
    res.status(s).send err
  next()

@notFound = (req, res, next) ->
  res.err 404, "Endpoint does not exist."

@errorHandler = (err, req, res, next) ->
  debug err.stack
  res.err err.status, err.message or err.stack or err.toString
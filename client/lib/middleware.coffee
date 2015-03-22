#
# Add req/res helpers & locals. As this grows we'll want to break it up into
# sub-modules in /lib/middleware, /lib/locals, etc.
#

viewHelpers = require './view_helpers'
debug = require('debug') 'client'
uaParser = require('ua-parser')

@helpers = (req, res, next) ->
  res.backboneError = (model, superagentRes) ->
    err = new Error(superagentRes.body.message) if superagentRes.body?.message
    err ?= superagentRes.error
    next err
  next()

@locals = (req, res, next) ->
  res.locals.sd.URL = req.url
  res.locals.sd.USER = req.user?.toJSON()
  res.locals.user = req.user
  res.locals[key] = helper for key, helper of viewHelpers
  next()

# TODO: Replace with app that renders a nice page
@errorHandler = (err, req, res, next) ->
  debug err.stack, err.message
  if err.message.match 'access token is invalid or has expired'
    return res.redirect '/logout'
  res.status(err.status or 500).send(
    "<pre>" + err.message or err.toString() + "</pre>"
  )

@ua = (req, res, next) ->
  r = uaParser.parse(req.get('user-agent'))
  res.locals.sd.IS_MOBILE = true if r.os.family in ['iOS', 'Android']
  next()

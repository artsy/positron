#
# Add req/res helpers & locals. As this grows we'll want to break it up into
# sub-modules in /lib/middleware, /lib/locals, etc.
#

viewHelpers = require './view_helpers'

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
  console.log err.stack, err.message
  res.status(err.status or 500).send(
    "<pre>" + err.message or err.toString() + "</pre>"
  )
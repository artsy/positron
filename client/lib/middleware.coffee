#
# Add req/res helpers & locals. As this grows we'll want to break it up into
# sub-modules in /lib/middleware, /lib/locals, etc.
#

viewHelpers = require './view_helpers'
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

@ua = (req, res, next) ->
  r = uaParser.parse(req.get('user-agent'))
  res.locals.sd.IS_MOBILE = true if r.os.family in ['iOS', 'Android']
  next()

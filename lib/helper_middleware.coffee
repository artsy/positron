#
# Add req/res helpers & locals. As this grows we'll want to break it up into
# sub-modules in /lib/middleware, /lib/locals, etc.
#

viewHelpers = require './view_helpers'

module.exports = (req, res, next) ->
  res.locals.sd.URL = req.url
  res.locals.sd.USER = req.user?.toJSON()
  res.locals.user = req.user
  res.locals[key] = helper for key, helper of viewHelpers
  next()
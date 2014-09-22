#
# Add req/res helpers & locals. As this grows we'll want to break it up into
# sub-modules in /lib/middleware, /lib/locals, etc.
#

viewHelpers = require './view_helpers'

module.exports = (req, res, next) ->
  res.backboneError = (model, response) -> next response
  res.locals.sd.PATH = req.path
  res.locals[key] = helper for key, helper of viewHelpers
  next()
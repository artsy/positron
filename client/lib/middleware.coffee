#
# Add req/res helpers & locals. As this grows we'll want to break it up into
# sub-modules in /lib/middleware, /lib/locals, etc.
#

viewHelpers = require './view_helpers'
uaParser = require 'ua-parser'
crypto = require 'crypto'
{ INTERCOM_SECRET } = process.env

@helpers = (req, res, next) ->
  res.backboneError = (model, err) ->
    next err
  next()

@locals = (req, res, next) ->
  res.locals.sd.URL = req.url
  res.locals.sd.USER = req.user?.toJSON()
  res.locals.sd.USER_HASH = crypto.createHmac('sha256', INTERCOM_SECRET)
    .update(req.user.id).digest('hex') if req.user
  res.locals.user = req.user
  res.locals[key] = helper for key, helper of viewHelpers
  next()

@ua = (req, res, next) ->
  r = uaParser.parse(req.get('user-agent'))
  res.locals.sd.USER_AGENT = req.get('user-agent')
  res.locals.sd.IS_MOBILE = true if r.os.family in ['iOS', 'Android']
  allowed = switch r.ua.family
    when 'Chrome' then r.ua.major >= 38
    when 'Firefox' then r.ua.major >= 34
    when 'Safari' then r.ua.major >= 7
    when 'Mobile Safari' then r.ua.major >= 7
    when 'IE' then r.ua.major >= 10
    when 'Android' then true
    when 'Android 2' then true
    else false
  if allowed
    next()
  else
    next new Error(
      "You must use the lastest version of Chrome, Safari, " +
      "Firefox, or Internet Explorer to use Artsy Writer."
    )
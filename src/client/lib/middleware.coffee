#
# Add req/res helpers & locals. As this grows we'll want to break it up into
# sub-modules in /lib/middleware, /lib/locals, etc.
#

viewHelpers = require './view_helpers'
crypto = require 'crypto'
Channel = require '../models/channel'
useragent = require 'useragent'

@helpers = (req, res, next) ->
  res.backboneError = (model, err) -> next err
  next()

@locals = (req, res, next) ->
  res.locals.sd.URL = req.url
  res.locals.sd.USER = req.user?.toJSON()
  res.locals.user = req.user
  res.locals.channel = new Channel req.user.get('current_channel') if req.user
  res.locals[key] = helper for key, helper of viewHelpers
  next()

@ua = (req, res, next) ->
  r = useragent.parse(req.get('user-agent'))
  res.locals.sd.USER_AGENT = req.get('user-agent')
  res.locals.sd.IS_MOBILE = true if r.os.family in ['iOS', 'Android']
  allowed = switch r.family
    when 'Chrome' then r.major >= 38
    when 'Firefox' then r.major >= 34
    when 'Safari' then r.major >= 7
    when 'Mobile Safari' then r.major >= 5
    when 'IE' then r.major >= 10
    when 'Android' then true
    when 'Android 2' then true
    else false
  if allowed
    next()
  else
    res.redirect('/unsupported')

# Makes sure that writer.artsy.net cannot be embedded elsewhere
@sameOrigin = (req, res, next) ->
  res.set('X-Frame-Options', 'SAMEORIGIN')
  next()

@adminOnly = (req, res, next) ->
  if req.user?.get('type') isnt 'Admin'
    err = new Error 'You must be logged in as an admin'
    err.status = 403
    next err
  else
    next()

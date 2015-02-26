{ present } = User = require './model'
{ API_URL } = process.env

# GET /api/users/:id
@show = (req, res, next) ->
  return res.send present req.user if req.isUser
  User.find req.params.id, (err, user) ->
    return next err if err
    res.send present user

# POST /api/users
@create = (req, res, next) ->
  User.upsertWithGravityData {
    id: req.body.artsy_id
    accessToken: req.get('X-Access-Token')
  }, (err, user) ->
    return next err if err
    res.send present user

# GET /api/users
@index = (req, res, next) ->
  User.where req.query, (err, json) ->
    return next err if err
    res.send json

# Middleware to deny non-admins access to certain user endpoint operations
@ownerOrAdminOnly = (req, res, next) ->
  req.isUser = req.params.id is req.user._id.toString()
  if not req.isUser and req.user.details?.type isnt 'Admin'
    res.err 401, 'Must be an admin or the user being accessed.'
  else
    next()

# Require a user middleware
@authenticated = (req, res, next) ->
  unless token = req.get('X-Access-Token')
    return res.err 401, 'You must pass a valid access token'
  next()

# Set the user from an access token and alias the `me` param
@setUser = (req, res, next) ->
  return next() unless token = req.get('X-Access-Token')
  User.fromAccessToken token, (err, user) ->

    # Stop all further requests if we can't find a user from that access token
    return next() if err?.message?.match 'invalid or has expired'
    return next err if err
    res.err 404, 'Could not find a user from that access token'  unless user?

    # Alias on the request object
    req.user = user

    # If `me` is passed as a value for any params, replace it with the
    # current user's id to transparently allow routes like
    # `/api/articles?author_id=me` or `/api/users/me`
    for set in ['params', 'body', 'query']
      for key, val of req[set]
        req[set][key] = user._id.toString() if val is 'me'

    next()

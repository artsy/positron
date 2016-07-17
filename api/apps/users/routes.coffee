{ present } = User = require './model'
{ API_URL } = process.env

# GET /api/users/me
@show = (req, res, next) ->
  res.send present req.user

# Require a user middleware
@authenticated = (req, res, next) ->
  unless req.accessToken
    return res.err 401, 'You must pass a valid access token'
  next()

# Require an admin middleware
@adminOnly = (req, res, next) ->
  return res.err 401, 'Must be an admin' unless req.user?.type is 'Admin'
  next()

# Set the user from an access token and alias the `me` param
@setUser = (req, res, next) ->
  return next() unless req.accessToken
  User.fromAccessToken req.accessToken, (err, user) ->

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

@refresh = (req, res, next) ->
  return next() unless req.accessToken
  User.refresh req.accessToken, (err, user) ->
    res.err 404, 'Could not find a user from that access token' unless user?
    req.user = user
    res.send present user

{ present } = User = require './model'
{ API_URL } = process.env

# GET /api/users/me
@me = (req, res, next) ->
  res.send present req.user

# DELETE /api/users/me
@deleteMe = (req, res, next) ->
  User.destroyFromAccessToken req.get('X-Access-Token'), (err, user) ->
    return next err if err
    res.send present user

# Require a user middleware
@authenticated = (req, res, next) ->
  unless token = req.get('X-Access-Token')
    return res.err 401, 'You must pass a valid access token'
  User.fromAccessToken token, (err, user) ->

    # Stop all further requests if we can't find a user from that access token
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
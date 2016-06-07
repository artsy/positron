_ = require 'underscore'
{ present } = Channel = require './model'

# GET /api/channels
@index = (req, res, next) ->
  Channel.where req.query, (err, results) ->
    return next err if err
    res.send results

# GET /api/channels/:id
@show = (req, res, next) ->
  res.send present req.channel

# POST /api/channels & PUT /api/channels/:id
@save = (req, res, next) ->
  Channel.save _.extend(req.body, id: req.params.id), (err, channel) ->
    return next err if err
    res.send present channel

# DELETE /api/channels/:id
@delete = (req, res, next) ->
  Channel.destroy req.channel._id, (err) ->
    return next err if err
    res.send present req.channel

# Fetch & attach a req.channel middleware
@find = (req, res, next) ->
  Channel.find req.params.id, (err, channel) ->
    return next err if err
    return res.err 404, 'Channel not found.' unless req.channel = channel
    next()

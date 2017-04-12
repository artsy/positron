_ = require 'underscore'
{ present } = Vertical = require './model'

# GET /api/verticals
@index = (req, res, next) ->
  Vertical.where req.query, (err, results) ->
    return next err if err
    res.send results

# GET /api/verticals/:id
@show = (req, res, next) ->
  res.send present req.vertical

# POST /api/verticals
@save = (req, res, next) ->
  Vertical.find req.body.name, (err, vertical) ->
    if vertical
      return res.err 409, 'Vertical already exists'
    Vertical.save _.extend(req.body, id: req.params.id), (err, vertical) ->
      return next err if err
      res.send present vertical

# PUT /api/verticals/:id
@update = (req, res, next) ->
  Vertical.save _.extend(req.body, id: req.params.id), (err, vertical) ->
    return next err if err
    res.send present vertical

# DELETE /api/verticals/:id
@delete = (req, res, next) ->
  Vertical.destroy req.vertical._id, (err) ->
    return next err if err
    res.send present req.vertical

# Fetch & attach a req.vertical middleware
@find = (req, res, next) ->
  Vertical.find req.params.id, (err, vertical) ->
    return next err if err
    return res.err 404, 'Vertical not found.' unless req.vertical = vertical
    next()

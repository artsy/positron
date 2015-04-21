_ = require 'underscore'
{ present } = Vertical = require './model'

# GET /api/verticals
@index = (req, res, next) ->
  Vertical.where req.query, (err, results) ->
    return next err if err
    res.send results

# GET /api/verticals/:id
@show = (req, res, next) ->
  Vertical.find req.params.id, (err, vertical) ->
    return next err if err
    res.send present vertical
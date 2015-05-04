Show = require './model'

# GET /api/shows?q=
@search = (req, res, next) ->
  Show.search req.query.q, req.get('x-access-token'), (err, data) ->
    return next err if err
    res.send data

# GET /api/shows/:id
@show = (req, res, next) ->
  Show.find req.params.id, req.get('x-access-token'), (err, show) ->
    return next err if err
    res.send show

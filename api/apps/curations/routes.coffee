_ = require 'underscore'
{ present } = Curation = require './model'

# GET /api/curations
@index = (req, res, next) ->
  Curation.where req.query, (err, results) ->
    return next err if err
    res.send results

# GET /api/curations/:id
@show = (req, res, next) ->
  res.send present req.curation

# POST /api/curations & PUT /api/curations/:id
@save = (req, res, next) ->
  console.log req.params
  console.log req.body
  Curation.save _.extend(req.body, id: req.params.id), (err, curation) ->
    return next err if err
    res.send present curation

# DELETE /api/curations/:id
@delete = (req, res, next) ->
  Curation.destroy req.curation._id, (err) ->
    return next err if err
    res.send present req.curation

# Fetch & attach a req.curation middleware
@find = (req, res, next) ->
  Curation.find req.params.id, (err, curation) ->
    return next err if err
    return res.err 404, 'Curation not found.' unless req.curation = curation
    next()

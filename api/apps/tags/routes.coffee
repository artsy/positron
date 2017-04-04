_ = require 'underscore'
{ present } = Tag = require './model'

# GET /api/tags
@index = (req, res, next) ->
  Tag.where req.query, (err, results) ->
    return next err if err
    res.send results

# GET /api/tags/:id
@show = (req, res, next) ->
  res.send present req.tag

# POST /api/tags
@save = (req, res, next) ->
  Tag.find req.body.name, (err, tag) ->
    if tag
      return res.err 409, 'Tag already exists'
    Tag.save _.extend(req.body, id: req.params.id), (err, tag) ->
      return next err if err
      res.send present tag

# PUT /api/tags/:id
@update = (req, res, next) ->
  Tag.save _.extend(req.body, id: req.params.id), (err, tag) ->
    return next err if err
    res.send present tag

# DELETE /api/tags/:id
@delete = (req, res, next) ->
  Tag.destroy req.tag._id, (err) ->
    return next err if err
    res.send present req.tag

# Fetch & attach a req.tag middleware
@find = (req, res, next) ->
  Tag.find req.params.id, (err, tag) ->
    return next err if err
    return res.err 404, 'Tag not found.' unless req.tag = tag
    next()

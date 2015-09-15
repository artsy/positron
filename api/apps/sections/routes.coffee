_ = require 'underscore'
{ present } = Section = require './model'

# GET /api/sections
@index = (req, res, next) ->
  Section.where req.query, (err, results) ->
    return next err if err
    res.send results

# GET /api/sections/:id
@show = (req, res, next) ->
  res.send present req.section

# POST /api/sections & PUT /api/sections/:id
@save = (req, res, next) ->
  Section.save _.extend(req.body, id: req.params.id), (err, section) ->
    return next err if err
    res.send present section

# DELETE /api/sections/:id
@delete = (req, res, next) ->
  Section.destroy req.section._id, (err) ->
    return next err if err
    res.send present req.section

# Fetch & attach a req.section middleware
@find = (req, res, next) ->
  Section.find req.params.id, (err, section) ->
    return next err if err
    return res.err 404, 'Section not found.' unless req.section = section
    next()

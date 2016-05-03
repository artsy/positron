_ = require 'underscore'
{ present } = LinkSet = require './model'

# GET /api/links
@index = (req, res, next) ->
  LinkSet.where req.query, (err, results) ->
    return next err if err
    res.send results

# GET /api/links/:id
@show = (req, res, next) ->
  res.send present req.linkSet

# POST /api/links & PUT /api/links/:id
@save = (req, res, next) ->
  LinkSet.save _.extend(req.body, id: req.params.id), (err, linkSet) ->
    return next err if err
    res.send present linkSet

# DELETE /api/links/:id
@delete = (req, res, next) ->
  LinkSet.destroy req.linkSet._id, (err) ->
    return next err if err
    res.send present req.linkSet

# Fetch & attach a req.linkSet middleware
@find = (req, res, next) ->
  LinkSet.find req.params.id, (err, linkSet) ->
    return next err if err
    return res.err 404, 'Link Set not found.' unless req.linkSet = linkSet
    next()

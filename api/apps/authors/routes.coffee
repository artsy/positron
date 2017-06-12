{ extend } = require 'underscore'
{ present } = Author = require './model'

# GET /api/authors
@index = (req, res, next) ->
  Author.where req.query, (err, results) ->
    return next err if err
    res.send results

# GET /api/authors/:id
@show = (req, res, next) ->
  res.send present req.author

# POST /api/authors & PUT /api/authors/:id
@save = (req, res, next) ->
  Author.save extend(req.body, id: req.params.id), (err, author) ->
    return next err if err
    res.send present author

# DELETE /api/authors/:id
@delete = (req, res, next) ->
  Author.destroy req.author._id, (err) ->
    return next err if err
    res.send present req.author

# Fetch & attach a req.author middleware
@find = (req, res, next) ->
  Author.find req.params.id, (err, author) ->
    return next err if err
    return res.err 404, 'Author not found.' unless req.author = author
    next()
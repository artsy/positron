_ = require 'underscore'
{ present } = Organization = require './model'

# GET /api/organizations
@index = (req, res, next) ->
  Organization.where req.query, (err, results) ->
    return next err if err
    res.send results

# GET /api/organizations/:id
@show = (req, res, next) ->
  res.send present req.organization

# POST /api/organizations & PUT /api/organizations/:id
@save = (req, res, next) ->
  Organization.save _.extend(req.body, id: req.params.id), (err, organization) ->
    return next err if err
    res.send present organization

# DELETE /api/organizations/:id
@delete = (req, res, next) ->
  Organization.destroy req.organization._id, (err) ->
    return next err if err
    res.send present req.organization

# Fetch & attach a req.organization middleware
@find = (req, res, next) ->
  Organization.find req.params.id, (err, organization) ->
    return next err if err
    return res.err 404, 'Organization not found.' unless req.organization = organization
    next()

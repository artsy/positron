_ = require 'underscore'
{ present } = BrandPartner = require './model'

# GET /api/brand-partners
@index = (req, res, next) ->
  BrandPartner.where req.query, (err, results) ->
    return next err if err
    res.send results

# GET /api/brand-partners/:id
@show = (req, res, next) ->
  res.send present req.brandPartner

# POST /api/brand-partners & PUT /api/brand-partners/:id
@save = (req, res, next) ->
  BrandPartner.save _.extend(req.body, id: req.params.id), (err, brandPartner) ->
    return next err if err
    res.send present brandPartner

# DELETE /api/brand-partners/:id
@delete = (req, res, next) ->
  BrandPartner.destroy req.brandPartner._id, (err) ->
    return next err if err
    res.send present req.brandPartner

# Fetch & attach a req.brandPartner middleware
@find = (req, res, next) ->
  BrandPartner.find req.params.id, (err, brandPartner) ->
    return next err if err
    return res.err 404, 'Brand Partner not found.' unless req.brandPartner = brandPartner
    next()

_ = require 'underscore'
Artwork = require './model'

# GET /api/artworks
@index = (req, res, next) ->
  Artwork.findByIds req.query.ids, req.get('x-access-token'), (err, artworks) ->
    return next err if err
    res.send results: artworks

# GET /api/artworks?q=
@search = (req, res, next) ->
  return next() unless query = req.query.q
  Artwork.search query, req.get('x-access-token'), (err, artworks) ->
    return next err if err
    res.send results: artworks

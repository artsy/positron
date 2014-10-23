_ = require 'underscore'
Artwork = require './model'

# GET /api/artworks
@index = (req, res, next) ->
  Artwork.findByIds req.query.ids, req.get('x-access-token'), (err, artworks) ->
    return next err if err
    res.send artworks
_ = require 'underscore'
Artist = require './model'

# GET /api/artist
@index = (req, res, next) ->
  Artist.findByIds req.query.ids, req.get('x-access-token'), (err, artists) ->
    return next err if err
    res.send results: artists

# GET /api/artists?q=
@search = (req, res, next) ->
  return next() unless query = req.query.q
  Artist.search query, req.get('x-access-token'), (err, artists) ->
    return next err if err
    res.send results: artists

_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
Artwork = require '../models/artwork.coffee'
async = require 'async'
{ ApiCollection, Filter } = require './mixins.coffee'

module.exports = class Artworks extends Backbone.Collection

  _.extend @prototype, Filter

  url: "#{sd.ARTSY_URL}/api/v1/artworks"

  model: Artwork

  getOrFetchIds: (ids, options) ->
    async.map ids or [], (id, cb) ->
      new Artwork(id: id).fetch
        error: options.error
        success: (artwork) -> cb null, artwork
    , (err, artworks) =>
      @add artworks
      options.success?()

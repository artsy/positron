_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
Artist = require '../models/artist.coffee'
async = require 'async'
{ Filter } = require './mixins.coffee'

module.exports = class Artists extends Backbone.Collection

  _.extend @prototype, Filter

  url: "#{sd.ARTSY_URL}/api/v1/artists"

  model: Artist

  getOrFetchIds: (ids, options) ->
    async.map ids or [], (id, cb) ->
      new Artist(id: id).fetch
        error: options.error
        success: (artist) -> cb null, artist
    , (err, artists) =>
      @add artists
      options.success?()

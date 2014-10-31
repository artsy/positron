Backbone = require 'backbone'
Artwork = require '../models/artwork.coffee'
sd = require('sharify').data

module.exports = class Artworks extends Backbone.Collection

  url: "#{sd.API_URL}/artworks"

  model: Artwork

  ids: ->
    @map (artwork) -> artwork.get('artwork').id

  parse: (data) ->
    { @total, @count } = data
    data.results
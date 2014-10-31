Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Artworks extends Backbone.Collection

  url: "#{sd.API_URL}/artworks"

  parse: (data) ->
    { @total, @count } = data
    data.results
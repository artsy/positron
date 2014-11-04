Backbone = require 'backbone'
sd = require('sharify').data
Artworks = require '../collections/artworks.coffee'

module.exports = class Section extends Backbone.Model

  urlRoot: "#{sd.API_URL}/sections"

  initialize: ->
    @artworks = new Artworks
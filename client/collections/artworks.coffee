_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
Artwork = require '../models/artwork.coffee'
{ ApiCollection } = require './mixins.coffee'

module.exports = class Artworks extends Backbone.Collection

  _.extend @prototype, ApiCollection

  url: "#{sd.API_URL}/artworks"

  model: Artwork

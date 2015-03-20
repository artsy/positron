_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
Artwork = require '../models/artwork.coffee'
{ ApiCollection } = require './mixins.coffee'

module.exports = class Artworks extends Backbone.Collection

  url: "#{sd.ARTSY_URL}/api/v1/artworks"

  model: Artwork

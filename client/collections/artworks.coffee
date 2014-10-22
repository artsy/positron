Backbone = require 'backbone'
Artwork = require '../models/artwork.coffee'
sd = require('sharify').data

module.exports = class Artworks extends Backbone.Collection

  model: Artwork
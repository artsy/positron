Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Artwork extends Backbone.Model

  urlRoot: "#{sd.ARTSY_URL}/api/artworks"
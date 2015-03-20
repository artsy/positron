_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
{ ArtworkHelpers } = require 'artsy-backbone-mixins'

module.exports = class Artwork extends Backbone.Model

  _.extend @prototype, ArtworkHelpers

  urlRoot: "#{sd.ARTSY_URL}/api/v1/artwork"

  truncatedLabel: ->
    'test'
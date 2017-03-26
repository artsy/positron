Backbone = require 'backbone'

module.exports = class HeroSection extends Backbone.Model

  initialize: ->
    @destroy = @clear

  # Overwrite isEmpty to check for empty key values
  isEmpty: ->
    @keys().length < 1

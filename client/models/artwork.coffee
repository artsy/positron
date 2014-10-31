_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Artwork extends Backbone.Model

  titleAndDate: ->
    _.without([
      @get('artwork').title
      @get('artwork').date
    ], null, '').join(', ')
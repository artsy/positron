Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Artwork extends Backbone.Model

  truncatedLabel: ->
    split = @get('artists')[0].name.split ' '
    artistInitials = split[0][0] + split[1][0]
    artistInitials + ' ' + @get('artwork').title + ', ' + @get('artwork').date
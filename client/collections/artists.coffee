_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
Artist = require '../models/artist.coffee'
{ Filter } = require './mixins.coffee'

module.exports = class Artists extends Backbone.Collection

  _.extend @prototype, Filter

  url: "#{sd.ARTSY_URL}/api/v1/artists"

  model: Artist

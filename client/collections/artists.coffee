_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
{ ApiCollection, Filter } = require './mixins.coffee'

module.exports = class Artists extends Backbone.Collection

  _.extend @prototype, ApiCollection
  _.extend @prototype, Filter

  url: "#{sd.API_URL}/artists"
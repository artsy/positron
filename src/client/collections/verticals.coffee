_ = require 'underscore'
Backbone = require 'backbone'
Vertical = require '../models/vertical.coffee'
sd = require('sharify').data
{ ApiCollection } = require './mixins.coffee'

module.exports = class Verticals extends Backbone.Collection
  _.extend @prototype, ApiCollection
  url: "#{sd.API_URL}/verticals"
  model: Vertical

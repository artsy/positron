_ = require 'underscore'
Backbone = require 'backbone'
Tag = require '../models/tag.coffee'
sd = require('sharify').data
{ ApiCollection } = require './mixins.coffee'

module.exports = class Tags extends Backbone.Collection

  _.extend @prototype, ApiCollection

  url: "#{sd.API_URL}/tags"

  model: Tag

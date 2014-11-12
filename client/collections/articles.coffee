_ = require 'underscore'
Backbone = require 'backbone'
Article = require '../models/article.coffee'
sd = require('sharify').data
{ ApiCollection } = require './mixins.coffee'

module.exports = class Articles extends Backbone.Collection

  _.extend @prototype, ApiCollection

  url: "#{sd.API_URL}/articles"

  model: Article
Backbone = require 'backbone'
Article = require '../models/article.coffee'

module.exports = class Articles extends Backbone.Collection

  model: Article
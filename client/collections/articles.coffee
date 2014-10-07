Backbone = require 'backbone'
Article = require '../models/article.coffee'
sd = require('sharify').data

module.exports = class Articles extends Backbone.Collection

  url: "#{sd.API_URL}/articles"

  model: Article

  parse: (data) ->
    { @total, @count } = data
    data.results
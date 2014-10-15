Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Article extends Backbone.Model

  defaults:
    sections: []

  urlRoot: "#{sd.API_URL}/articles"

  stateName: ->
    if @get('published') then 'Article' else 'Draft'
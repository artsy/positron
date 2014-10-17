_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
Sections = require '../collections/sections.coffee'

module.exports = class Article extends Backbone.Model

  urlRoot: "#{sd.API_URL}/articles"

  initialize: ->
    @sections = new Sections @get 'sections'

  stateName: ->
    if @get('published') then 'Article' else 'Draft'

  toJSON: ->
    sections = if @sections.length then @sections.toJSON() else @get 'sections'
    _.extend super, sections: sections
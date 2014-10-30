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

  finishedContent: ->
    @get('title')?.length > 0

  finishedThumbnail: ->
    @get('thumbnail_title')?.length > 0 and
    @get('thumbnail_image')?.length > 0 and
    @get('thumbnail_teaser')?.length > 0 and
    @get('tags')?.length > 0

  toJSON: ->
    sections = if @sections.length then @sections.toJSON() else @get 'sections'
    _.extend super, sections: sections
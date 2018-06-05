#
# Article Model
#
# Use `simple` mode when dealing with article data that doesn't need associations
# For an example of `simple` usage, see the Queue panel
#

{ extend } = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
Sections = require '../collections/sections.coffee'

module.exports = class Article extends Backbone.Model

  urlRoot: "#{sd.API_URL}/articles"

  initialize: (attributes, options = {}) ->
    unless options.simple
      @sections = new Sections @get 'sections'

  toJSON: ->
    extended = {}
    extended.sections = @sections.toJSON() if @sections?.length
    extend super, extended

  replaceLink: (taggedText, link) ->
    @sections.map (section) ->
      if section.get('type') is 'text'
        text = section.get('body')
        if text.includes(taggedText)
          section.set('body', text.replace(taggedText, link))

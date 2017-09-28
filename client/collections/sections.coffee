_ = require 'underscore'
Backbone = require 'backbone'
Section = require '../models/section.coffee'

module.exports = class Sections extends Backbone.Collection

  model: Section

  mentionedArtistSlugs: ->
    _.compact _.flatten @map (section) ->
      switch section.get 'type'
        when 'text'
          section.slugsFromHTML(section.get('body'), 'artist')
        when 'image_set', 'image_collection'
          _.map section.get('images'), (image) ->
            if image.type is 'artwork'
              _.map image.artists, (artist) -> artist.id
            else
              section.slugsFromHTML(image.caption, 'artist')

  mentionedArtworkSlugs: ->
    _.compact _.flatten @map (section) ->
      switch section.get 'type'
        when 'text'
          section.slugsFromHTML(section.get('body'), 'artwork')
        when 'image_set', 'image_collection'
          _.map section.get('images'), (image) ->
            if image.type is 'artwork'
              image.slug
            else
              section.slugsFromHTML(image.caption, 'artwork')

  removeBlank: ->
    blanks = @select (section) ->
      switch section.get('type')
        when 'video' then not section.get('url')
        when 'text' then not section.get('body')
        else false
    @remove section for section in blanks

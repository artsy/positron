_ = require 'underscore'
Backbone = require 'backbone'
Section = require '../models/section.coffee'

module.exports = class Sections extends Backbone.Collection

  model: Section

  mentionedArtistSlugs: ->
    _.compact _.flatten @map (section) ->
      switch section.get 'type'
        when 'text'
          section.slugsFromHTML 'body', 'artist'
        when 'image_set'
          _.map section.images, (image) ->
            if image.type is 'artwork' and image.artists
              _.map image.artists, (artist) -> artist.id

  mentionedArtworkSlugs: ->
    _.compact _.flatten @map (section) ->
      switch section.get 'type'
        when 'text'
          section.slugsFromHTML 'body', 'artwork'
        when 'image_set'
          _.map section.get('images'), (image) ->
            image.slug if image.type is 'artwork'

  removeBlank: ->
    blanks = @select (section) ->
      switch section.get('type')
        when 'image', 'video' then not section.get('url')
        when 'text' then not section.get('body')
        when 'artworks' then not section.get('ids')?.length
        else false
    @remove section for section in blanks

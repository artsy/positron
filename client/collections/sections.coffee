_ = require 'underscore'
Backbone = require 'backbone'
Section = require '../models/section.coffee'

module.exports = class Sections extends Backbone.Collection

  model: Section

  mentionedArtistSlugs: ->
    _.compact _.flatten @map (section) ->
      switch section.get 'type'
        when 'artworks'
          section.artworks.map (artwork) -> artwork.get('artist')?.id
        when 'text'
          section.slugsFromHTML 'body', 'artist'
        when 'image'
          section.slugsFromHTML 'caption', 'artist'

  mentionedArtworkSlugs: ->
    _.compact _.flatten @map (section) ->
      switch section.get 'type'
        when 'artworks'
          section.get 'ids'
        when 'text'
          section.slugsFromHTML 'body', 'artwork'
        when 'image'
          section.slugsFromHTML 'caption', 'artwork'

  removeBlank: ->
    blanks = @select (section) ->
      switch section.get('type')
        when 'image', 'video' then not section.get('url')
        when 'text' then not section.get('body')
        when 'artworks' then not section.get('ids')?.length
        else false
    @remove section for section in blanks
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
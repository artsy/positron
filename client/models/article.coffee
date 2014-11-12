_ = require 'underscore'
Backbone = require 'backbone'
Artists = require '../collections/artists.coffee'
Artworks = require '../collections/artworks.coffee'
sd = require('sharify').data
Sections = require '../collections/sections.coffee'
$ = require 'jquery'

module.exports = class Article extends Backbone.Model

  urlRoot: "#{sd.API_URL}/articles"

  initialize: ->
    @sections = new Sections @get 'sections'
    @featuredArtists = new Artists
    @mentionedArtists = new Artists
    @featuredArtworks = new Artworks
    @mentionedArtworks = new Artworks

  stateName: ->
    if @get('published') then 'Article' else 'Draft'

  finishedContent: ->
    @get('title')?.length > 0

  finishedThumbnail: ->
    @get('thumbnail_title')?.length > 0 and
    @get('thumbnail_image')?.length > 0 and
    @get('thumbnail_teaser')?.length > 0 and
    @get('tags')?.length > 0

  fetchFeatured: (options = {}) ->
    @featuredArtists.getOrFetchIds @get('featured_artist_ids'), options
    @featuredArtworks.getOrFetchIds @get('featured_artwork_ids'), options

  fetchMentioned: (options = {}) ->
    @mentionedArtists.getOrFetchIds @sections.mentionedArtistSlugs(), options
    @mentionedArtworks.getOrFetchIds @sections.mentionedArtworkSlugs(), options

  toJSON: ->
    extended = {}
    extended.sections = @sections.toJSON() if @sections.length
    if @featuredArtworks.length
      extended.featured_artwork_ids = @featuredArtworks.pluck('id')
    if @featuredArtists.length
      extended.featured_artist_ids = @featuredArtists.pluck('id')
    _.extend super, extended
_ = require 'underscore'
Backbone = require 'backbone'
Artists = require '../collections/artists.coffee'
Artworks = require '../collections/artworks.coffee'
sd = require('sharify').data
Sections = require '../collections/sections.coffee'
Section = require '../models/section.coffee'
request = require 'superagent'
async = require 'async'

module.exports = class Article extends Backbone.Model

  urlRoot: "#{sd.API_URL}/articles"

  initialize: ->
    @sections = new Sections @get 'sections'
    @featuredPrimaryArtists = new Artists
    @featuredArtists = new Artists
    @mentionedArtists = new Artists
    @featuredArtworks = new Artworks
    @mentionedArtworks = new Artworks
    @heroSection = new Section @get 'hero_section'
    @on 'change:hero_section', => @heroSection.set @get 'hero_section'
    @heroSection.destroy = @heroSection.clear

  stateName: ->
    if @get('published') then 'Article' else 'Draft'

  finishedContent: ->
    @get('title')?.length > 0

  finishedThumbnail: ->
    @get('thumbnail_title')?.length > 0 and
    @get('thumbnail_image')?.length > 0

  fetchFeatured: (options = {}) ->
    options.success = _.after 3, options.success if options.success?
    @featuredPrimaryArtists.getOrFetchIds(
      @get('primary_featured_artist_ids'), options)
    @featuredArtists.getOrFetchIds(
      @get('featured_artist_ids'), options)
    @featuredArtworks.getOrFetchIds(
      @get('featured_artwork_ids'), options)

  fetchMentioned: (options = {}) ->
    options.success = _.after 2, options.success if options.success?
    @mentionedArtists.getOrFetchIds @sections.mentionedArtistSlugs(), options
    @mentionedArtworks.getOrFetchIds @sections.mentionedArtworkSlugs(), options

  featuredList: (mentioned, featured) ->
    featured ?= mentioned
    list = []
    for model in @['mentioned' + mentioned].notIn(@['featured' + featured])
      list.push { featured: false, model: model }
    @['featured' + featured].each (model) ->
      list.push { featured: true, model: model }
    list = _.sortBy list, (item) ->
      if mentioned is 'Artworks'
        item.model.get('title')
      else
        item.model.get('name')

  fetchAndCollectKeywords: (options) ->
    keywords = []
    callbacks = []
    if @get('primary_featured_artist_ids')
      for artistId in @get('primary_featured_artist_ids')
        do (artistId) ->
          callbacks.push (callback) ->
            request
              .get("#{sd.ARTSY_URL}/api/v1/artist/#{artistId}")
              .set('X-Xapp-Token': sd.ACCESS_TOKEN)
              .end callback
    if @get('featured_artist_ids')
      for artistId in @get('featured_artist_ids')
        do (artistId) ->
          callbacks.push (callback) ->
            request
              .get("#{sd.ARTSY_URL}/api/v1/artist/#{artistId}")
              .set('X-Xapp-Token': sd.ACCESS_TOKEN)
              .end callback
    if @get('fair_id')
      fairId = @get('fair_id')
      callbacks.push (callback) ->
        request
          .get("#{sd.ARTSY_URL}/api/v1/fair/#{fairId}")
          .set('X-Xapp-Token': sd.ACCESS_TOKEN)
          .end callback
    if @get('partner_ids')
      for partnerId in @get('partner_ids')
        do (partnerId) ->
          callbacks.push (callback) ->
            request
              .get("#{sd.ARTSY_URL}/api/v1/partner/#{partnerId}")
              .set('X-Xapp-Token': sd.ACCESS_TOKEN)
              .end callback
    async.parallel callbacks, (err, results) =>
      return options.error err if err
      keywords = (res.body.name for res in results)
      for tag in @get('tags')
        do (tag) ->
          keywords.push(tag)
      console.log keywords
      # options.success keywords
     

  toJSON: ->
    extended = {}
    extended.sections = @sections.toJSON() if @sections.length
    if @heroSection.keys().length
      extended.hero_section = @heroSection.toJSON()
    else
      extended.hero_section = null
    if @featuredArtworks.length
      extended.featured_artwork_ids = @featuredArtworks.pluck('_id')
    if @featuredArtists.length
      extended.featured_artist_ids = @featuredArtists.pluck('_id')
    if @featuredPrimaryArtists.length
      extended.primary_featured_artist_ids = @featuredPrimaryArtists.pluck('_id')
    _.extend super, extended

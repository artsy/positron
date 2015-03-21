_ = require 'underscore'
Backbone = require 'backbone'
Artists = require '../collections/artists.coffee'
Artworks = require '../collections/artworks.coffee'
sd = require('sharify').data
Sections = require '../collections/sections.coffee'
request = require 'superagent'

module.exports = class Article extends Backbone.Model

  urlRoot: "#{sd.API_URL}/articles"

  initialize: ->
    @sections = new Sections @get 'sections'
    @featuredPrimaryArtists = new Artists
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
        item.model.get('artist').name

  toJSON: ->
    extended = {}
    extended.sections = @sections.toJSON() if @sections.length
    if @featuredArtworks.length
      extended.featured_artwork_ids = @featuredArtworks.pluck('_id')
    if @featuredArtists.length
      extended.featured_artist_ids = @featuredArtists.pluck('id')
    if @featuredPrimaryArtists.length
      extended.primary_featured_artist_ids = @featuredPrimaryArtists.pluck('id')
    extended.slug = undefined
    _.extend super, extended

  sync: ->
    return if window?
    super

  syncToPost: (options = {}) ->
    request
      .get("#{sd.API_URL}/sync_to_post?article_id=#{@get 'id'}")
      .set('X-Access-Token': options.accessToken)
      .end (err, res) =>
        return options.error? e if e = err or res.error
        options.success? res.body

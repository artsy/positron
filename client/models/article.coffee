#
# Article Model
#
# Use `simple` mode when dealing with article data that doesn't need associations
# For an example of `simple` usage, see the Queue panel
#

_ = require 'underscore'
_s = require 'underscore.string'
Backbone = require 'backbone'
Artists = require '../collections/artists.coffee'
Artworks = require '../collections/artworks.coffee'
sd = require('sharify').data
Sections = require '../collections/sections.coffee'
Section = require '../models/section.coffee'
request = require 'superagent'
moment = require 'moment'

module.exports = class Article extends Backbone.Model

  urlRoot: "#{sd.API_URL}/articles"

  initialize: (attributes, options = {}) ->
    unless options.simple
      @sections = new Sections @get 'sections'
      @featuredPrimaryArtists = new Artists
      @featuredArtists = new Artists
      @mentionedArtists = new Artists
      @featuredArtworks = new Artworks
      @mentionedArtworks = new Artworks
      @heroSection = new Backbone.Model @get 'hero_section'
      @on 'change:hero_section', =>
        @heroSection.set @get 'hero_section'
      @heroSection.destroy = @heroSection.clear

  stateName: ->
    if @get('published') then 'Article' else 'Draft'

  finishedContent: ->
    @get('title')?.length > 0

  getSlug: ->
    slug = if @get('slug') then @get('slug') else @get('thumbnail_title')
    _s.slugify(@get('author')?.name + '-' + slug)

  getFullSlug: ->
    "https://artsy.net/article/" + @getSlug()

  getByline: ->
    return _s.toSentence(_.pluck(@get('contributing_authors'), 'name')) if @hasContributingAuthors()
    return @get('author').name if @get('author')
    ''

  getPublishDate: ->
    date = new Date
    if @get('published')
      date = @get('published_at')
    else if @get('scheduled_publish_at')
      date = @get('scheduled_publish_at')
    return moment(date).local().toISOString()

  date: (attr) ->
    if @get(attr)
      moment(new Date(@get(attr))).local()
    else
      moment(new Date()).local()

  hasContributingAuthors: ->
    @get('contributing_authors')?.length > 0

  getDescription: (attr = '') ->
    @get(attr) or @get('description')

  getThumbnailImage: (attr = '') ->
    @get(attr) or @get('thumbnail_image')

  getThumbnailTitle: (attr = '') ->
    @get(attr) or @get('thumbnail_title')

  finishedThumbnail: ->
    @get('thumbnail_title')?.length > 0 and
    @get('thumbnail_image')?.length > 0

  fetchFeatured: (options = {}) ->
    options.success = _.after 3, options.success if options.success?
    @featuredPrimaryArtists.getOrFetchIds(
      @get('primary_featured_artist_ids'), options)
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

  getObjectAttribute: (object, attribute) ->
    if @get(object) and _.has @get(object), attribute
      @get(object)["#{attribute}"]
    else
      ''

  toJSON: ->
    extended = {}
    extended.sections = @sections.toJSON() if @sections?.length
    if @heroSection?.keys().length
      extended.hero_section = @heroSection.toJSON()
    else if @heroSection
      extended.hero_section = null
    _.extend super, extended

  replaceLink: (taggedText, link) ->
    @sections.map (section) ->
      if section.get('type') is 'text'
        text = section.get('body')
        if text.includes(taggedText)
          section.set('body', text.replace(taggedText, link))

_ = require 'underscore'
Backbone = require 'backbone'
featuredArtistsTemplate = -> require('./featured_artists.jade') arguments...
featuredArtworksTemplate = -> require('./featured_artworks.jade') arguments...

module.exports = class EditAdmin extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @render = _.debounce @render, 500
    @article.featuredArtists.on 'sync', @renderFeatured
    @article.mentionedArtists.on 'sync', @renderFeatured
    @article.featuredArtworks.on 'sync', @renderFeatured
    @article.mentionedArtworks.on 'sync', @renderFeatured
    @article.on 'open:tab', (i) => @onOpen() if i is 2

  onOpen: ->
    @article.fetchFeatured()
    @article.fetchMentioned()

  renderFeatured: =>
    @$('#eaf-artists').html featuredArtistsTemplate
      mentionedArtists: @article.mentionedArtists.models
      featuredArtists: @article.featuredArtists.models
    @$('#eaf-artworks').html featuredArtworksTemplate
      mentionedArtworks: @article.mentionedArtworks.models
      featuredArtworks: @article.featuredArtworks.models

  events:
    'change .eaf-artist-input': (e) -> @addFeatured('Artists')(e)
    'change .eaf-artwork-input': (e) -> @addFeatured('Artworks')(e)

  addFeatured: (suffix) => (e) =>
    $t = $ e.currentTarget
    id = _.last $t.val().split('/')
    $t.parent().addClass 'bordered-input-loading'
    @article['featured' + suffix].getOrFetchIds [id],
      complete: -> $t.val('').parent().removeClass 'bordered-input-loading'
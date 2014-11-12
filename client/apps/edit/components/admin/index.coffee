_ = require 'underscore'
Backbone = require 'backbone'
featuredArtistsTemplate = -> require('./featured_artists.jade') arguments...
featuredArtworksTemplate = -> require('./featured_artworks.jade') arguments...

module.exports = class EditAdmin extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @article.featuredArtists.on 'add remove', @renderFeatured
    @article.mentionedArtists.on 'sync', @renderFeatured
    @article.featuredArtworks.on 'add remove', @renderFeatured
    @article.mentionedArtworks.on 'sync', @renderFeatured
    @article.on 'open:tab2', @onOpen

  onOpen: =>
    console.log 'fetch'
    @article.fetchFeatured()
    @article.fetchMentioned()

  renderFeatured: =>
    @$('#eaf-artists li:not(.eaf-input-li)').remove()
    @$('#eaf-artists .eaf-input-li').before $ featuredArtistsTemplate
      mentionedArtists: @article.mentionedArtists.notIn @article.featuredArtists
      featuredArtists: @article.featuredArtists.models
    @$('#eaf-artworks li:not(.eaf-input-li)').remove()
    @$('#eaf-artworks .eaf-input-li').before $ featuredArtworksTemplate
      mentionedArtworks: @article.mentionedArtworks.notIn @article.featuredArtworks
      featuredArtworks: @article.featuredArtworks.models

  events:
    'change .eaf-artist-input': (e) -> @featureFromInput('Artists') e
    'change .eaf-artwork-input': (e) -> @featureFromInput('Artworks') e
    'click #eaf-artists .eaf-featured': (e)-> @unfeature('Artists') e
    'click #eaf-artworks .eaf-featured': (e)-> @unfeature('Artworks') e
    'click #eaf-artists .eaf-mentioned': (e) -> @featureMentioned('Artists') e
    'click #eaf-artworks .eaf-mentioned': (e) -> @featureMentioned('Artworks') e

  featureFromInput: (resource) => (e) =>
    $t = $ e.currentTarget
    id = _.last $t.val().split('/')
    $t.parent().addClass 'bordered-input-loading'
    @article['featured' + resource].getOrFetchIds [id],
      complete: -> $t.val('').parent().removeClass 'bordered-input-loading'

  featureMentioned: (resource) => (e) =>
    @article['featured' + resource].add(
      @article['mentioned' + resource].get $(e.currentTarget).attr 'data-id'
    )

  unfeature: (resource) => (e) =>
    id = $(e.currentTarget).attr 'data-id'
    @article['featured' + resource].remove id

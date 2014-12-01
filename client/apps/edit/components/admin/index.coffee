_ = require 'underscore'
Backbone = require 'backbone'
async = require 'async'
featuredListTemplate = -> require('./featured_list.jade') arguments...
sd = require('sharify').data

module.exports = class EditAdmin extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @article.on 'open:tab2', @onOpen
    @setupAutocomplete()

  setupAutocomplete: ->
    Autocomplete = require '../../../../components/autocomplete/index.coffee'
    new Autocomplete
      el: @$('#edit-admin-change-author input')
      url: "#{sd.API_URL}/users?q=%QUERY"
      filter: (res) -> for r in res.results
        { id: r.id, value: r.user.name + ', ' + (r.details?.email or '') }
      selected: @onAutocompleteSelect

  onAutocompleteSelect: (e, item) =>
    return unless confirm "Are you sure you want to change the author?"
    @article.save { author_id: item.id }, success: =>
      @article.trigger 'finished'

  onOpen: =>
    async.parallel [
      (cb) => @article.fetchFeatured success: -> cb()
      (cb) => @article.fetchMentioned success: -> cb()
    ], =>
      @renderFeatured()
      @article.featuredPrimaryArtists.on 'add remove', @renderFeatured
      @article.featuredArtists.on 'add remove', @renderFeatured
      @article.featuredArtworks.on 'add remove', @renderFeatured

  renderFeatured: =>
    @$('#eaf-primary-artists li:not(.eaf-input-li)').remove()
    @$('#eaf-primary-artists .eaf-input-li').before $(
      featuredListTemplate list: @article.featuredList('Artists', 'PrimaryArtists')
    )
    @$('#eaf-artists li:not(.eaf-input-li)').remove()
    @$('#eaf-artists .eaf-input-li').before $(
      featuredListTemplate list: @article.featuredList('Artists')
    )
    @$('#eaf-artworks li:not(.eaf-input-li)').remove()
    @$('#eaf-artworks .eaf-input-li').before $(
      featuredListTemplate list: @article.featuredList('Artworks')
    )

  events:
    'change #eaf-primary-artists .eaf-artist-input': (e) ->
      @featureFromInput('PrimaryArtists') e
    'change #eaf-artists .eaf-artist-input': (e) ->
      @featureFromInput('Artists') e
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

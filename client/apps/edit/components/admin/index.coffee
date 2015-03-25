_ = require 'underscore'
Backbone = require 'backbone'
request = require 'superagent'
async = require 'async'
featuredListTemplate = -> require('./featured_list.jade') arguments...
sd = require('sharify').data
_s = require 'underscore.string'
moment = require 'moment'

module.exports = class EditAdmin extends Backbone.View

  initialize: ({ @article }) ->
    @article.on 'open:tab2', @onOpen
    @setupAuthorAutocomplete()
    @setupFairAutocomplete()
    @setupPartnerAutocomplete()
    @setupAuctionAutocomplete()
    @setupPublishDate()
    @setupSlug()

  setupAuthorAutocomplete: ->
    Autocomplete = require '../../../../components/autocomplete/index.coffee'
    new Autocomplete
      el: @$('#edit-admin-change-author input')
      url: "#{sd.API_URL}/users?q=%QUERY"
      filter: (res) -> for r in res.results
        { id: r.id, value: _.compact([r.user.name, r.details?.email]).join(', ') }
      selected: @onAuthorSelect

  onAuthorSelect: (e, item) =>
    return unless confirm "Are you sure you want to change the author?"
    @article.trigger('finished').save(author_id: item.id)

  setupFairAutocomplete: ->
    AutocompleteSelect = require '../../../../components/autocomplete_select/index.coffee'
    select = AutocompleteSelect @$('#edit-admin-fair .edit-admin-right')[0],
      url: "#{sd.ARTSY_URL}/api/v1/match/fairs?term=%QUERY"
      placeholder: 'Search fair by name...'
      filter: (res) -> for r in res
        { id: r._id, value: r.name }
      selected: (e, item) =>
        @article.save fair_id: item.id
      cleared: =>
        @article.save fair_id: null
    if id = @article.get 'fair_id'
      request
        .get("#{sd.ARTSY_URL}/api/v1/fair/#{id}")
        .set('X-Access-Token': sd.USER.access_token).end (err, res) ->
          select.setState value: res.body.name, loading: false
    else
      select.setState loading: false

  setupPartnerAutocomplete: ->
    AutocompleteSelect = require '../../../../components/autocomplete_select/index.coffee'
    select = AutocompleteSelect @$('#edit-admin-partner .edit-admin-right')[0],
      url: "#{sd.ARTSY_URL}/api/v1/match/partners?term=%QUERY"
      placeholder: 'Search partner by name...'
      filter: (res) -> for r in res
        { id: r._id, value: r.name }
      selected: (e, item) =>
        @article.save partner_ids: [item.id]
      cleared: =>
        @article.save partner_ids: null
    if id = @article.get('partner_ids')?[0]
      request
        .get("#{sd.ARTSY_URL}/api/v1/partner/#{id}")
        .set('X-Access-Token': sd.USER.access_token).end (err, res) ->
          select.setState value: res.body.name, loading: false
    else
      select.setState loading: false

  setupAuctionAutocomplete: ->
    AutocompleteSelect = require '../../../../components/autocomplete_select/index.coffee'
    select = AutocompleteSelect @$('#edit-admin-auction .edit-admin-right')[0],
      url: "#{sd.ARTSY_URL}/api/v1/match/sales?term=%QUERY"
      placeholder: 'Search auction by name...'
      filter: (res) -> for r in res
        { id: r._id, value: r.name }
      selected: (e, item) =>
        @article.save auction_id: item.id
      cleared: =>
        @article.save auction_id: null
    if id = @article.get 'auction_id'
      request
        .get("#{sd.ARTSY_URL}/api/v1/sale/#{id}")
        .set('X-Access-Token': sd.USER.access_token).end (err, res) ->
          select.setState value: res.body.name, loading: false
    else
      select.setState loading: false

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
    'click #eaf-primary-artists .eaf-mentioned': (e) ->
      @featureMentioned('PrimaryArtists') e
    'click #eaf-primary-artists .eaf-featured': (e)->
      @unfeature('PrimaryArtists') e

    'change #eaf-artists .eaf-artist-input': (e) ->
      @featureFromInput('Artists') e
    'click #eaf-artists .eaf-mentioned': (e) ->
      @featureMentioned('Artists') e
    'click #eaf-artists .eaf-featured': (e)->
      @unfeature('Artists') e

    'change .eaf-artwork-input': (e) ->
      @featureFromInput('Artworks') e
    'click #eaf-artworks .eaf-mentioned': (e) ->
      @featureMentioned('Artworks') e
    'click #eaf-artworks .eaf-featured': (e)->
      @unfeature('Artworks') e
    'click .edit-admin-slug-generate': 'setSlugFromTitle'

  featureFromInput: (resource) => (e) =>
    $t = $ e.currentTarget
    id = _.last $t.val().split('/')
    $t.parent().addClass 'bordered-input-loading'
    @article['featured' + resource].getOrFetchIds [id],
      complete: =>
        $t.val('').parent().removeClass 'bordered-input-loading'
        @article.save()

  featureMentioned: (resource) => (e) =>
    id = $(e.currentTarget).attr 'data-id'
    if resource is 'Artworks'
      mentioned = @article.mentionedArtworks.get id
    else
      mentioned = @article.mentionedArtists.get id
    @article['featured' + resource].add(mentioned)
    @article.save()

  unfeature: (resource) => (e) =>
    id = $(e.currentTarget).attr 'data-id'
    @article['featured' + resource].remove id
    @article.save()

  setupSlug: ->
    if $('.edit-admin-slug-input').val() is @generateSlugFromTitle()
      $('.edit-admin-slug-generate').hide()
    else
      $('.edit-admin-slug-generate').show()
    $('.edit-admin-slug-input').on 'keyup', _.debounce( @saveslug , 1000 )

  slugify: ->
    t = $('.edit-admin-slug-input')
    slug = _s.slugify(t.val())
    t.val slug

  saveslug: =>
    @slugify()
    false

  generateSlugFromTitle: ->
    cat = [@article.get('author').name, @article.get('title')].join('-')
    return _s.slugify(cat)

  setSlugFromTitle: (e) ->
    e.preventDefault()
    slug = @generateSlugFromTitle()
    @article.save slug: slug
    $(e.target).prev().val(slug)
    $(e.target).hide()

  setupPublishDate: ->
    $('.edit-admin-input-date').on 'keyup', @formatAndSetPublishDate($('.edit-admin-input-date').val())
    @formatAndSetPublishDate()

  formatAndSetPublishDate: (date) ->
    formattedDate = moment(date).format('L')
    $('.edit-admin-input-date').val(formattedDate)
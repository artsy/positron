_ = require 'underscore'
Backbone = require 'backbone'
request = require 'superagent'
async = require 'async'
featuredListTemplate = -> require('./featured_list.jade') arguments...
sd = require('sharify').data
_s = require 'underscore.string'
moment = require 'moment'
ImageUploadForm = require '../../../../components/image_upload_form/index.coffee'
{ crop } = require('embedly-view-helpers')(sd.EMBEDLY_KEY)

module.exports = class EditAdmin extends Backbone.View

  initialize: ({ @article }) ->
    @article.on 'open:tab2', @onOpen
    @setupAuthorAutocomplete()
    @setupFairAutocomplete()
    @setupPartnerAutocomplete()
    @setupAuctionAutocomplete()
    @setupSectionAutocomplete()
    @setupShowsAutocomplete()
    @setupBiographyAutocomplete()
    @setupPublishDate()
    @renderScheduleState()
    @setupContributingAuthors()
    @setupEmailMetadata()
    @setupSuperArticleImages()
    @setupSuperArticleAutocomplete()

  setupAuthorAutocomplete: ->
    Autocomplete = require '../../../../components/autocomplete/index.coffee'
    new Autocomplete
      el: @$('#edit-admin-change-author input')
      url: "#{sd.ARTSY_URL}/api/v1/match/users?term=%QUERY"
      placeholder: 'Search by user name or email...'
      filter: (users) -> for user in users
        { id: user.id, value: _.compact([user.name, user.email]).join(', ') }
      selected: @onAuthorSelect

  onAuthorSelect: (e, item) =>
    return unless confirm "Are you sure you want to change the author?"
    @article.trigger('finished').save(author_id: item.id)

  setupFairAutocomplete: ->
    AutocompleteSelect = require '../../../../components/autocomplete_select/index.coffee'
    select = AutocompleteSelect @$('#edit-admin-fair')[0],
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
    AutocompleteList = require '../../../../components/autocomplete_list/index.coffee'
    list = new AutocompleteList @$('#edit-admin-partner')[0],
      name: 'partner_ids[]'
      url: "#{sd.ARTSY_URL}/api/v1/match/partners?term=%QUERY"
      placeholder: 'Search partner by name...'
      filter: (res) -> for r in res
        { id: r._id, value: r.name }
      selected: (e, item, items) =>
        @article.save partner_ids: _.pluck items, 'id'
      removed: (e, item, items) =>
        @article.save partner_ids: _.without(_.pluck(items, 'id'),item.id)
    if ids = @article.get('partner_ids')
      @partners = []
      async.each ids, (id, cb) =>
        request
          .get("#{sd.ARTSY_URL}/api/v1/partner/#{id}")
          .set('X-Access-Token': sd.USER.access_token).end (err, res) =>
            @partners.push id: res.body._id, value: res.body.name
            cb()
      , =>
        list.setState loading: false, items: @partners
    else
      list.setState loading: false

  setupAuctionAutocomplete: ->
    AutocompleteSelect = require '../../../../components/autocomplete_select/index.coffee'
    select = AutocompleteSelect @$('#edit-admin-auction')[0],
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

  setupSectionAutocomplete: ->
    AutocompleteList = require '../../../../components/autocomplete_list/index.coffee'
    @section_ids = @article.get 'section_ids' or []
    list = new AutocompleteList @$('#edit-admin-section')[0],
      name: 'section_ids[]'
      url: "#{sd.API_URL}/sections?q=%QUERY"
      placeholder: 'Search section by name...'
      filter: (sections) -> for section in sections.results
        { id: section.id, value: section.title }
      selected: (e, item, items) =>
        @article.save section_ids: _.pluck items, 'id'
      removed: (e, item, items) =>
        @article.save section_ids: _.without(_.pluck(items, 'id'),item.id)
    if ids = @section_ids
      @sections = []
      async.each ids, (id, cb) =>
        request
          .get("#{sd.API_URL}/sections/#{id}").end (err, res) =>
            @sections.push id: res.body.id, value: res.body.title
            cb()
      , =>
        list.setState loading: false, items: @sections
    else
      list.setState loading: false

  setupShowsAutocomplete: ->
    AutocompleteList = require '../../../../components/autocomplete_list/index.coffee'
    @show_ids = @article.get 'show_ids' or []
    list = new AutocompleteList @$('#edit-admin-shows')[0],
      name: 'show_ids[]'
      url: "#{sd.API_URL}/shows?q=%QUERY"
      placeholder: 'Search show by name...'
      selected: (e, item, items) =>
        @article.save show_ids: _.pluck items, 'id'
      removed: (e, item, items) =>
        @article.save show_ids: _.without(_.pluck(items,'id'),item.id)
    if ids = @show_ids
      @shows = []
      async.each ids, (id, cb) =>
        request
          .get("#{sd.API_URL}/show/#{id}")
          .set('X-Access-Token': sd.USER.access_token).end (err, res) =>
            @shows.push id: res.body._id, value: res.body.name
            cb()
      , =>
        list.setState loading: false, items: @shows
    else
      list.setState loading: false

  setupBiographyAutocomplete: ->
    AutocompleteSelect = require '../../../../components/autocomplete_select/index.coffee'
    select = AutocompleteSelect @$('#edit-admin-biography')[0],
      url: "#{sd.ARTSY_URL}/api/v1/match/artists?term=%QUERY"
      placeholder: 'Search artist by name...'
      filter: (artists) -> for artist in artists
        { id: artist._id, value: artist.name }
      selected: (e, item) =>
        @article.save biography_for_artist_id: item.id
      cleared: =>
        @article.save biography_for_artist_id: null
    if id = @article.get 'biography_for_artist_id'
      request
        .get("#{sd.ARTSY_URL}/api/v1/artist/#{id}")
        .set('X-Access-Token': sd.USER.access_token).end (err, res) ->
          select.setState value: res.body.name, loading: false
    else
      select.setState loading: false

  setupContributingAuthors: ->
    AutocompleteList = require '../../../../components/autocomplete_list/index.coffee'
    @contributing_authors = @article.get 'contributing_authors' or []
    list = new AutocompleteList @$('#edit-admin-contributing-authors')[0],
      name: 'contributing_authors[]'
      url: "#{sd.ARTSY_URL}/api/v1/match/users?term=%QUERY"
      placeholder: 'Search by user name or email...'
      filter: (users) -> for user in users
        { id: { id: user.id, name: user.name, profile_id: user.default_profile_id }, value: _.compact([user.name, user.email]).join(', ') }
      selected: (e, item, items) =>
        @article.save contributing_authors: _.pluck items, 'id'
      removed: (e, item, items) =>
        @article.save contributing_authors: _.without(_.pluck(items, 'id'),item.id)
    if @article.get('contributing_authors')?.length
      @authors = []
      ids = @article.get('contributing_authors')
      async.each ids, (id, cb) =>
        request
          .get("#{sd.ARTSY_URL}/api/v1/user/#{id.id}")
          .set('X-Access-Token': sd.USER.access_token).end (err, res) =>
            @authors.push(
              {
                id: { id: res.body.id , name: res.body.name, profile_id: res.body.default_profile_id },
                value: _.compact([res.body.name, res.body.email]).join(', ')
              })
            cb()
      , =>
        list.setState loading: false, items: @authors
    else
      list.setState loading: false

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

  setupEmailMetadata: ->
    renderInputs = (src) ->
      $('.edit-email-large-image-url input').val(
        crop(src, { width: 1280, height: 960 } ))
      $('.edit-email-small-image-url input').val(
        crop(src, { width: 552, height: 392 } ))
    if @article.get('email_metadata')?.image_url
      renderInputs @article.get('email_metadata').image_url
    new ImageUploadForm
      el: $('#edit-email-upload')
      src: @article.get('email_metadata')?.image_url
      remove: =>
        emailMetadata = @article.get('email_metadata') or {}
        emailMetadata.image_url = ''
        $('.edit-email-large-image-url').val ''
        $('.edit-email-small-image-url').val ''
        @article.save email_metadata: emailMetadata
      done: (src) =>
        emailMetadata = @article.get('email_metadata') or {}
        emailMetadata.image_url = src
        renderInputs src

  setupSuperArticleImages: ->
    new ImageUploadForm
      el: $('#edit-partner-logo-upload')
      src: @article.get('super_article')?.partner_logo
      remove: =>
        superArticle = @article.get('super_article') or {}
        superArticle.partner_logo = ''
        @article.save super_article: superArticle
      done: (src) =>
        superArticle = @article.get('super_article') or {}
        superArticle.partner_logo = src
        @article.save super_article: superArticle
    new ImageUploadForm
      el: $('#edit-secondary-partner-logo-upload')
      src: @article.get('super_article')?.secondary_partner_logo
      remove: =>
        superArticle = @article.get('super_article') or {}
        superArticle.secondary_partner_logo = ''
        @article.save super_article: superArticle
      done: (src) =>
        superArticle = @article.get('super_article') or {}
        superArticle.secondary_partner_logo = src
        @article.save super_article: superArticle

  setupSuperArticleAutocomplete: ->
    AutocompleteList = require '../../../../components/autocomplete_list/index.coffee'
    @related_articles = if @article.get('super_article')?.related_articles then @article.get('super_article').related_articles else []
    list = new AutocompleteList @$('#edit-admin-related-articles')[0],
      name: 'related_articles[]'
      url: "#{sd.API_URL}/articles?published=true&q=%QUERY"
      placeholder: 'Search article by title...'
      filter: (articles) ->
        for article in articles.results
          { id: article.id, value: "#{article.title}, #{article.author?.name}"} unless article.is_super_article
      selected: (e, item, items) =>
        superArticle = @article.get('super_article') or {}
        superArticle.related_articles = _.pluck items, 'id'
        @article.save super_article: superArticle
      removed: (e, item, items) =>
        superArticle = @article.get('super_article') or {}
        superArticle.related_articles = _.without(_.pluck(items,'id'),item.id)
        @article.save super_article: superArticle
    if ids = @related_articles
      @articles = []
      async.each ids, (id, cb) =>
        request
          .get("#{sd.API_URL}/articles/#{id}")
          .set('X-Access-Token': sd.USER.access_token).end (err, res) =>
            @articles.push id: res.body.id, value: "#{res.body.title}, #{res.body.author?.name}"
            cb()
      , =>
        list.setState loading: false, items: @articles
    else
      list.setState loading: false

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
    'click #edit-schedule-button': 'toggleScheduled'

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

  setupPublishDate: ->
    $('.edit-admin-input-date, .edit-admin-input-time').on 'blur', =>
      dateAndTime = @$('.edit-admin-input-date').val() + ' ' + @$('.edit-admin-input-time').val()
      @formatAndSetPublishDate dateAndTime
      @article.save published_at: @saveFormat
      false
    @formatAndSetPublishDate @article.get('published_at')

  formatAndSetPublishDate: (date) ->
    date = new Date(date)
    clientFormat = moment(date).format('L')
    publishTime = moment(date).format('HH:mm')
    @saveFormat = moment(date).toDate()
    $('.edit-admin-input-date').val(clientFormat)
    $('.edit-admin-input-time').val(publishTime)

  toggleScheduled: (e) ->
    e.preventDefault()
    if @article.get('scheduled_publish_at')
      @article.save scheduled_publish_at: null
    else
      @schedulePublish()
    @renderScheduleState()

  schedulePublish: ->
    if @$('.edit-admin-input-time').val() is undefined
      alert 'Please enter a time.'
      return
    if @article.finishedContent() and @article.finishedThumbnail()
      dateAndTime = @$('.edit-admin-input-date').val() + ' ' + @$('.edit-admin-input-time').val()
      @article.save scheduled_publish_at: moment(dateAndTime, 'MM/DD/YYYY HH:mm').toDate()
    else
      @article.trigger 'missing'

  renderScheduleState: ->
    if @article.get('scheduled_publish_at')
      publishTime = moment(@article.get('scheduled_publish_at')).format('HH:mm')
      @$('.edit-admin-input-time').val(publishTime)
      @$('#edit-schedule-button').addClass('edit-button-when-scheduled')
      @$('.edit-admin-input-date, .edit-admin-input-time').attr('readonly', true)
    else
      @$('#edit-schedule-button').removeClass('edit-button-when-scheduled')
      @$('.edit-admin-input-date, .edit-admin-input-time').attr('readonly', false)

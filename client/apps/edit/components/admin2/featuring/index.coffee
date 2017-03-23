React = require 'react'
ReactDOM = require 'react-dom'
async = require 'async'
sd = require('sharify').data
_ = require 'underscore'
{ div, label, input, form, span } = React.DOM
AutocompleteList = require '../../../../../components/autocomplete_list/index.coffee'

module.exports = React.createClass
  displayName: 'AdminFeaturing'

  getInitialState: ->
    partner_ids: @props.article.get('partner_ids') || null
    show_ids: @props.article.get('show_ids') || null
    fair_ids: @props.article.get('fair_ids') || []
    auction_ids: @props.article.get('auction_ids') || []
    primary_featured_artist_ids: @props.article.get('primary_featured_artist_ids') || null
    PrimaryArtists: @props.article.featuredPrimaryArtists.models
    featured_artist_ids: @props.article.get('featured_artist_ids') || null
    Artists: @props.article.featuredArtists.models
    featured_artwork_ids: @props.article.get('featured_artwork_ids') || null
    Artworks: @props.article.featuredArtworks.models

  componentDidMount: ->
    @setupShowsAutocomplete()
    @setupAutocomplete('partner_ids')
    @setupAutocomplete('fair_ids')
    @setupAutocomplete('auction_ids')

  setupAutocomplete: (field) ->
    fieldSingle = field.replace('_ids', '')
    fieldPlural = fieldSingle + 's'
    return unless @props.channel.hasAssociation fieldPlural
    fieldPlural = if field isnt 'auction_ids' then fieldPlural else 'sales'
    list = new AutocompleteList $(@refs[field])[0],
      name: field + '[]'
      url: "#{sd.ARTSY_URL}/api/v1/match/#{fieldPlural}?term=%QUERY"
      placeholder: "Search #{fieldSingle} by name..."
      filter: (res) -> for r in res
        { id: r._id, value: r.name }
      selected: (e, item, items) =>
        newState = @state
        newState[field] = _.pluck items, 'id'
        @setState newState
      removed: (e, item, items) =>
        newState = @state
        newState[field] = _.without(_.pluck(items, 'id'),item.id)
        @setState newState
    if ids = @props.article.get field
      fieldSingle = if field isnt 'auction_ids' then fieldSingle else 'sale'
      @ids = []
      async.each ids, (id, cb) =>
        request
          .get("#{sd.ARTSY_URL}/api/v1/#{fieldSingle}/#{id}")
          .set('X-Access-Token': sd.USER.access_token).end (err, res) =>
            @ids.push id: res.body._id, value: res.body.name
            cb()
      , =>
        list.setState loading: false, items: @ids
    else
      list.setState loading: false

  setupShowsAutocomplete: ->
    return unless @props.channel.hasAssociation 'shows'
    @show_ids = @props.article.get 'show_ids' or []
    list = new AutocompleteList $(@refs['show_ids'])[0],
      name: 'show_ids[]'
      url: "#{sd.API_URL}/shows?q=%QUERY"
      placeholder: 'Search show by name...'
      selected: (e, item, items) =>
        @setState show_ids: _.pluck items, 'id'
      removed: (e, item, items) =>
        @setState show_ids: _.without(_.pluck(items,'id'),item.id)
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

  onInputChange: (e) ->
    e.preventDefault()
    featured = e.target.name
    $t = $(e.target).find('input')
    id = _.last $t.val().split('/')
    $t.addClass 'bordered-input-loading'
    @props.article['featured' + featured].getOrFetchIds [id],
      complete: =>
        newState = @state
        newState[featured] = @props.article['featured' + featured].models
        @setState newState
        $t.val('').removeClass 'bordered-input-loading'

  featureMentioned: (e) ->
    featured = $(e.currentTarget).attr 'data-type'
    id = $(e.currentTarget).attr 'data-id'
    if featured is 'Artworks'
      mentioned = @props.article.mentionedArtworks.get id
      @props.article.mentionedArtworks.remove id
    else
      featured = $(e.currentTarget).closest('form').attr('name')
      mentioned = @props.article.mentionedArtists.get id
      @props.article.mentionedArtists.remove id
    @props.article['featured' + featured].add(mentioned)
    newState = @state
    newState[featured] = @props.article['featured' + featured].models
    @setState newState

  unfeature: (e) ->
    id = $(e.currentTarget).attr 'data-id'
    featured = $(e.currentTarget).attr 'data-type'
    @props.article['featured' + featured].remove id
    newState = @state
    newState[featured] = @props.article['featured' + featured].models
    @setState newState

  getFeatured: (type) ->
    @state[type].map (item, i) =>
      div {
        key: i
        className: 'feature-mention feature'
        'data-id': item.get('id')
        'data-type': type
        onClick: @unfeature
      },
        span {className: 'name' }, item.get('name') || item.get('title')
        span {className: 'remove' }

  getMentioned: (type, featureType) ->
    @isFeatured = @state[featureType].map (item, i) -> item.id
    @props.article[ 'mentioned' + type].models?.map (item, i) =>
      unless @isFeatured.includes(item.id)
        div {
          key: i
          className: 'feature-mention mention'
          'data-id': item.get('id')
          'data-type': type
          onClick: @featureMentioned
        },
          span {className: 'name' }, item.get('name') || item.get('title')
          span {className: 'mention' }

  render: ->
    div { className: 'edit-admin--featuring edit-admin__fields'},
      div {className: 'fields-full'},
        div {className: 'fields-left'},
          div {className: 'field-group'},
            label {}, 'Partner'
            div { ref: 'partner_ids' }

        div {className: 'fields-right'},
          div {className: 'field-group'},
            label {}, 'Fair'
            div { ref: 'fair_ids' }

      div {className: 'fields-full'},
        div {className: 'fields-left'},
          div {className: 'field-group'},
            label {}, 'Show'
            div { ref: 'show_ids' }

        div {className: 'fields-right'},
          div {className: 'field-group'},
            label {}, 'Auction'
            div { ref: 'auction_ids' }

      div {className: 'fields-full'},

        div {className: 'fields-col-3'},
          form {
            className: 'field-group'
            onSubmit: @onInputChange
            name: 'PrimaryArtists'
          },
            label {}, 'Primary Artists'
            input {
              placeholder: 'Add an artist by slug or url...'
              className: 'bordered-input'
            }
            @getFeatured('PrimaryArtists')
            @getMentioned('Artists', 'PrimaryArtists')

        div {className: 'fields-col-3'},
          form {
            className: 'field-group'
            onSubmit: @onInputChange
            name: 'Artists'
          },
            label {}, 'Secondary Artists'
            input {
              placeholder: 'Add an artist by slug or url...'
              className: 'bordered-input'
            }
            @getFeatured('Artists')
            @getMentioned('Artists', 'Artists')

        div {className: 'fields-col-3'},
          form {
            className: 'field-group'
            onSubmit: @onInputChange
            name: 'Artworks'
          },
            label {}, 'Artworks'
            input {
              placeholder: 'Add an artist by slug or url...'
              className: 'bordered-input'
            }
            @getFeatured('Artworks')
            @getMentioned('Artworks', 'Artworks')

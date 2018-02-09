React = require 'react'
ReactDOM = require 'react-dom'
sd = require('sharify').data
_ = require 'underscore'
{ div, label, input, form, span } = React.DOM
AutocompleteList = React.createFactory require '../../../../../components/autocomplete_list/index.coffee'

module.exports = React.createClass
  displayName: 'AdminFeaturing'

  componentDidMount: ->
    ReactDOM.findDOMNode(@refs.container).classList += ' active'

  onInputChange: (e) ->
    e.preventDefault()
    featured = e.target.name
    $t = $(e.target).find('input')
    id = _.last $t.val().split('/')
    $t.addClass 'bordered-input-loading'
    @props.article['featured' + featured].getOrFetchIds [id],
      complete: =>
        @onChangeFeatured(featured)
        @forceUpdate()
        $t.val('').removeClass 'bordered-input-loading'

  onChangeFeatured: (featuredType) ->
    if featuredType is 'Artworks'
      field = 'featured_artwork_ids'
    else
      field = 'primary_featured_artist_ids'
    featured = @props.article['featured' + featuredType].pluck('_id')
    @props.onChange(field, featured)

  featureMentioned: (e) ->
    featured = $(e.currentTarget).attr 'data-type'
    id = $(e.currentTarget).attr 'data-id'
    if featured is 'Artworks'
      mentioned = @props.article.mentionedArtworks.get id
    else
      featured = $(e.currentTarget).closest('form').attr('name')
      mentioned = @props.article.mentionedArtists.get id
    @props.article['featured' + featured].add(mentioned)
    @onChangeFeatured(featured)
    @forceUpdate()

  unfeature: (e) ->
    id = $(e.currentTarget).attr 'data-id'
    featured = $(e.currentTarget).attr 'data-type'
    @props.article['featured' + featured].remove id
    @onChangeFeatured(featured)
    @forceUpdate()

  selectAllMentioned: (e) ->
    type = $(e.currentTarget).attr('name')
    featured = if type is 'Artists' then 'PrimaryArtists' else type
    @props.article['mentioned' + type].models.forEach (item, i) =>
      @props.article['featured' + featured].add(item)
    @onChangeFeatured(featured)
    @forceUpdate()

  sortFeatured: (featured) ->
    featured.models?.sort (a, b) ->
      nameA = a.get('name')?.toLowerCase() || a.get('title')?.toLowerCase()
      nameB = b.get('name')?.toLowerCase() || b.get('title')?.toLowerCase()
      return -1 if nameA < nameB
      return 1 if nameA > nameB
      return 0
    return featured

  getFeatured: (type) ->
    featured = @sortFeatured @props.article['featured' + type]
    featured.models?.map (item, i) =>
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
    @isFeatured = @props.article['featured' + featureType].models.map (item, i) -> item.id
    mentioned = @sortFeatured @props.article[ 'mentioned' + type]
    mentioned.models?.map (item, i) =>
      if !@isFeatured.includes(item.id)
        div {
          key: i
          className: 'feature-mention mention'
          'data-id': item.get('id')
          'data-type': type
          onClick: @featureMentioned
        },
          span {className: 'name' }, item.get('name') || item.get('title')
          span {className: 'mention' }
      else
        return false

  showSelectAllMentioned: (type, featureType) ->
    if @props.article[ 'mentioned' + type].models?.length
      isFeatured = @props.article['featured' + featureType].models.map (item, i) -> item.id
      notFeatured = []
      @props.article[ 'mentioned' + type].models?.map (item, i) =>
        unless isFeatured.includes(item.id)
          notFeatured.push item
      if notFeatured?.length
        div {
          className: 'field-group--inline flat-checkbox'
          onClick: @selectAllMentioned
          name: type
        },
          input {
            type: 'checkbox'
          }
          label {}, 'Feature all mentioned ' + type

  render: ->
    div { className: 'edit-admin--featuring edit-admin__fields', ref: 'container'},
      unless @props.channel.type is 'team'
        div {className: 'fields-full'},
          div {className: 'fields-left'},
            div {className: 'field-group'},
              label {}, 'Partner'
              AutocompleteList {
                url: "#{sd.ARTSY_URL}/api/v1/match/partners?term=%QUERY"
                placeholder: "Search partners by name..."
                filter: (res) -> for r in res
                  { id: r._id, value: r.name }
                selected: (e, item, items) =>
                  @props.onChange 'partner_ids', _.pluck items, 'id'
                removed: (e, item, items) =>
                  @props.onChange 'partner_ids', _.without(_.pluck(items, 'id'),item.id)
                idsToFetch: @props.article.get 'partner_ids'
                fetchUrl: (id) -> "#{sd.ARTSY_URL}/api/v1/partner/#{id}"
                resObject: (res) ->
                  id: res.body._id, value: res.body.name
              }
          div {className: 'fields-right'},
            div {className: 'field-group'},
              label {}, 'Fair'
              AutocompleteList {
                url: "#{sd.ARTSY_URL}/api/v1/match/fairs?term=%QUERY"
                placeholder: "Search fairs by name..."
                filter: (res) -> for r in res
                  { id: r._id, value: r.name }
                selected: (e, item, items) =>
                  @props.onChange 'fair_ids', _.pluck items, 'id'
                removed: (e, item, items) =>
                  @props.onChange 'fair_ids', _.without(_.pluck(items, 'id'),item.id)
                idsToFetch: @props.article.get 'fair_ids'
                fetchUrl: (id) -> "#{sd.ARTSY_URL}/api/v1/fair/#{id}"
                resObject: (res) ->
                  id: res.body._id, value: res.body.name
              }
      unless @props.channel.type is 'team'
        div {className: 'fields-full'},
          div {className: 'fields-left'},
            div {className: 'field-group'},
              label {}, 'Show'
              div { ref: 'show_ids' }
              AutocompleteList {
                url: "#{sd.API_URL}/shows?q=%QUERY"
                placeholder: "Search shows by name..."
                selected: (e, item, items) =>
                  @props.onChange 'show_ids', _.pluck items, 'id'
                removed: (e, item, items) =>
                  @props.onChange 'show_ids', _.without(_.pluck(items, 'id'),item.id)
                idsToFetch: @props.article.get 'show_ids'
                fetchUrl: (id) -> "#{sd.API_URL}/show/#{id}"
                resObject: (res) ->
                  id: res.body._id, value: res.body.name
              }
          div {className: 'fields-right'},
            div {className: 'field-group'},
              label {}, 'Auction'
              AutocompleteList {
                url: "#{sd.ARTSY_URL}/api/v1/match/sales?term=%QUERY"
                placeholder: "Search auctions by name..."
                filter: (res) -> for r in res
                  { id: r._id, value: r.name }
                selected: (e, item, items) =>
                  @props.onChange 'auction_ids', _.pluck items, 'id'
                removed: (e, item, items) =>
                  @props.onChange 'auction_ids', _.without(_.pluck(items, 'id'),item.id)
                idsToFetch: @props.article.get 'auction_ids'
                fetchUrl: (id) -> "#{sd.ARTSY_URL}/api/v1/sale/#{id}"
                resObject: (res) ->
                  id: res.body._id, value: res.body.name
              }

      div {className: 'fields-full'},
        div {className: 'fields-left'},
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
            @showSelectAllMentioned('Artists', 'PrimaryArtists')
            @getMentioned('Artists', 'PrimaryArtists')
        div {className: 'fields-right'},
          form {
            className: 'field-group'
            onSubmit: @onInputChange
            name: 'Artworks'
          },
            label {}, 'Artworks'
            input {
              placeholder: 'Add an artwork by slug or url...'
              className: 'bordered-input'
            }
            @getFeatured('Artworks')
            @showSelectAllMentioned('Artworks', 'Artworks')
            @getMentioned('Artworks', 'Artworks')

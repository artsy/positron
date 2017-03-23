React = require 'react'
ReactDOM = require 'react-dom'
{ div, label, input } = React.DOM
Autocomplete = require '../../../../../components/autocomplete/index.coffee'
AutocompleteSelect = require '../../../../../components/autocomplete_select/index.coffee'

module.exports = React.createClass
  displayName: 'AdminAppearances'

  getInitialState: ->
    fair_programming_ids: @props.article.get('fair_programming_ids') || []
    fair_about_ids: @props.article.get('fair_about_ids') || []
    fair_artsy_ids: @props.article.get('fair_artsy_ids') || []
    biography_for_artist_id: @props.article.get('biography_for_artist_id') || null

  componentDidMount: ->
    @setupBiographyAutocomplete()

  setupBiographyAutocomplete: ->
    $el = $(@refs.biography_for_artist_id)[0]
    select = new AutocompleteSelect $el,
      url: "#{sd.ARTSY_URL}/api/v1/match/artists?term=%QUERY"
      placeholder: 'Search artist by name...'
      filter: (artists) -> for artist in artists
        { id: artist._id, value: artist.name }
      selected: (e, item) =>
        @setState biography_for_artist_id: item.id
        select.setState value: item.name, loading: false
      cleared: =>
        @setState biography_for_artist_id: null
    if id = @props.article.get 'biography_for_artist_id'
      request
        .get("#{sd.ARTSY_URL}/api/v1/artist/#{id}")
        .set('X-Access-Token': sd.USER.access_token).end (err, res) ->
          select.setState value: res.body.name, loading: false
    else
      select.setState loading: false


  render: ->
    div { className: 'edit-admin--appearances edit-admin__fields'},
      div {className: 'fields-left'},

        div {className: 'field-group'},
          label {}, 'Fair Programming'

        div {className: 'field-group'},
          label {}, 'About the Fair'

      div {className: 'fields-right'},

        div {className: 'field-group'},
          label {}, 'Artsy at the Fair'

        div {className: 'field-group'},
          label {}, 'Extended Artist Biography'
          div { ref: 'biography_for_artist_id', value: @state.biography_for_artist_id }
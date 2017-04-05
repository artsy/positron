React = require 'react'
ReactDOM = require 'react-dom'
{ div, label, input } = React.DOM
request = require 'superagent'
sd = require('sharify').data

AutocompleteSelect = require '../../../../../components/autocomplete_select/index.coffee'
AutocompleteList = React.createFactory require '../components/autocomplete.coffee'

module.exports = React.createClass
  displayName: 'AdminAppearances'

  componentDidMount: ->
    @setupBiographyAutocomplete()

  componentWillUnmount: ->
    $(@refs.biography_for_artist_id).each (i, ref) ->
      ReactDOM.unmountComponentAtNode(ref)

  setupBiographyAutocomplete: ->
    $el = $(@refs.biography_for_artist_id)[0]
    select = new AutocompleteSelect $el,
      url: "#{sd.ARTSY_URL}/api/v1/match/artists?term=%QUERY"
      placeholder: 'Search artist by name...'
      filter: (artists) -> for artist in artists
        { id: artist._id, value: artist.name }
      selected: (e, item) =>
        select.setState value: item.name, loading: false
        @props.onChange 'biography_for_artist_id', item.id
      cleared: =>
        @props.onChange 'biography_for_artist_id', null
    if id = @props.article.get 'biography_for_artist_id'
      request
        .get("#{sd.ARTSY_URL}/api/v1/artist/#{id}")
        .set('X-Access-Token': sd.USER.access_token).end (err, res) ->
          select.setState value: res.body.name, loading: false
    else
      select.setState loading: false

  render: ->
    div { className: 'edit-admin--appearances edit-admin__fields'},
      div {className: 'fields-full'},
        div {className: 'fields-left'},
          div {className: 'field-group'},
            label {}, 'Fair Programming'
              AutocompleteList {
                field: 'fair_programming_ids'
                onChange: @props.onChange
                article: @props.article
                channel: @props.channel
              }
        div {className: 'fields-right'},
          div {className: 'field-group'},
            label {}, 'Artsy at the Fair'
            AutocompleteList {
              field: 'fair_artsy_ids'
              onChange: @props.onChange
              article: @props.article
              channel: @props.channel
            }

      div {className: 'fields-full'},
        div {className: 'fields-left'},
          div {className: 'field-group'},
            label {}, 'About the Fair'
              AutocompleteList {
                field: 'fair_about_ids'
                onChange: @props.onChange
                article: @props.article
                channel: @props.channel
              }
        div {className: 'fields-right'},
          div {className: 'field-group'},
            label {}, 'Extended Artist Biography'
            div { ref: 'biography_for_artist_id' }
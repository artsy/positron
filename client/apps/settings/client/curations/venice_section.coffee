React = require 'react'
ReactDOM = require 'react-dom'
{ div, input, label, section, textarea } = React.DOM
AutocompleteList = React.createFactory require '../../../../components/autocomplete_list/index.coffee'
imageUpload = React.createFactory require '../../../edit/components/admin/components/image_upload.coffee'

module.exports = VeniceSection = React.createClass
  displayName: 'VeniceSection'

  getInitialState: ->
    title: @props.section.title or ''
    description: @props.section.description or ''
    video_url: @props.section.video_url or ''
    artist_ids: @props.section.artist_ids or []
    cover_image: @props.section.cover_image or ''
    published: @props.section.published or ''

  onInputChange: (e) ->
    @onChange e.target.name, e.target.value

  onChange: (key, value) ->
    newState = @state
    newState[key] = value
    @setState newState

  render: ->
    div { className: 'venice-admin__fields'},
      div { className: 'fields--full'},
        div { className: 'field-group fields--left' },
          label {},'Title'
          input {
            className: 'bordered-input'
            placeholder: 'Title'
            defaultValue: @state.title
            onChange: @onInputChange
            name: 'title'
          }
        div { className: 'field-group fields--right' },
          label {},'Video URL'
          input {
            className: 'bordered-input'
            placeholder: 'Enter a link'
            defaultValue: @state.video_url
            onChange: @onInputChange
            name: 'video_url'
          }
      div { className: 'field-group' },
        label {}, 'Description'
        textarea {
          className: 'bordered-input'
          placeholder: 'Description'
          defaultValue: @state.description
          onChange: @onInputChange
          name: 'description'
        }
      div { className: 'fields--full'},
        div { className: 'field-group fields--left' },
          label {}, 'Cover Image'
          imageUpload {
            name: 'cover_image'
            src: @state.cover_image
            onChange: @onChange
          }
        div { className: 'field-group fields--right' },
          label {}, 'Featured Artists'
          AutocompleteList {
            url: "#{sd.ARTSY_URL}/api/v1/match/artists?term=%QUERY"
            placeholder: "Search artists by name..."
            filter: (res) -> for r in res
              { id: r._id, value: r.name }
            selected: (e, item, items) =>
              @onChange 'artist_ids', _.pluck items, 'id'
            removed: (e, item, items) =>
              @onChange 'artist_ids', _.without(_.pluck(items, 'id'),item.id)
            idsToFetch: @state.artist_ids
            fetchUrl: (id) -> "#{sd.ARTSY_URL}/api/v1/artist/#{id}"
            resObject: (res) ->
              id: res.body._id, value: res.body.name
          }
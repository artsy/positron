React = require 'react'
ReactDOM = require 'react-dom'
moment = require 'moment'
_s = require 'underscore.string'
{ div, input, label, span, textarea } = React.DOM
AutocompleteList = React.createFactory require '../../../../components/autocomplete_list/index.coffee'
imageUpload = React.createFactory require '../../../edit/components/admin/components/image_upload.coffee'

module.exports = VeniceSection = React.createClass
  displayName: 'VeniceSection'

  getInitialState: ->
    title: @props.section.title or ''
    description: @props.section.description or ''
    video_url: @props.section.video_url or ''
    video_url_medium: @props.section.video_url_medium or ''
    video_url_adaptive: @props.section.video_url_adaptive or ''
    video_url_external: @props.section.video_url_external or ''
    video_length: @props.section.video_length or null
    artist_ids: @props.section.artist_ids or []
    cover_image: @props.section.cover_image or ''
    published: @props.section.published or false
    release_date: moment(@props.section.release_date).format('YYYY-MM-DD') or null
    slug: @props.section.slug or ''

  componentDidMount: ->
    ReactDOM.findDOMNode(@refs.container).classList += ' active'
    @setupSlug()

  setupSlug: ->
    if !@props.section.slug and @props.section.title
      @setState slug: _s.slugify @props.section.title

  onInputChange: (e) ->
    @onChange e.target.name, e.target.value

  onChange: (key, value) ->
    if key is 'slug'
      value = _s.slugify value
    newState = @state
    newState[key] = value
    @setState newState
    @props.onChange newState, @props.id

  onCheckboxChange: (e) ->
    @onChange 'published', !@state.published

  onDateChange: (e) ->
    @onChange 'release_date', moment(e.target.value).toISOString()

  render: ->
    div { className: 'venice-admin__fields', ref: 'container'},
      div { className: 'fields--full'},
        div { className: 'fields--left' },
          div { className: 'field-group' },
            label {},'Title'
            input {
              className: 'bordered-input'
              placeholder: 'Title'
              defaultValue: @state.title
              onChange: @onInputChange
              name: 'title'
            }
          div { className: 'field-group' },
            label {},'Slug'
            input {
              className: 'bordered-input'
              placeholder: 'enter-a-slug'
              value: @state.slug
              onChange: @onInputChange
              name: 'slug'
              disabled: @state.published
            }
        div { className: 'fields--right' },
          div { className: 'fields--full published' },
            div { className: 'field-group date' },
              label {},'Release Date'
              input {
                type: 'date'
                className: 'bordered-input'
                defaultValue: moment(@state.release_date).format('YYYY-MM-DD')
                onChange: @onDateChange
              }
            div {
              className: 'field-group--inline flat-checkbox'
              onClick: @onCheckboxChange
            },
              input {
                type: 'checkbox'
                checked: @state.published
                value: @state.published
                readOnly: true
              }
              label {},'Published'
          div { className: 'field-group time' },
            label {},'Video Length'
            input {
              className: 'bordered-input'
              defaultValue: @state.video_length
              placeholder: '4:33'
              onChange: @onInputChange
              name: 'video_length'
            }
      div { className: 'fields--full video' },
        div { className: 'field-group video-url' },
          label {},'High Quality Video URL'
          input {
            className: 'bordered-input'
            placeholder: 'Enter a link'
            defaultValue: @state.video_url
            onChange: @onInputChange
            name: 'video_url'
          }
        div { className: 'field-group video-url' },
          label {},'Medium Quality Video URL'
          input {
            className: 'bordered-input'
            placeholder: 'Enter a link'
            defaultValue: @state.video_url_medium
            onChange: @onInputChange
            name: 'video_url_medium'
          }
        div { className: 'field-group video-url' },
          label {},'Adaptive Video URL'
          input {
            className: 'bordered-input'
            placeholder: 'Enter a link'
            defaultValue: @state.video_url_adaptive
            onChange: @onInputChange
            name: 'video_url_adaptive'
          }
        div { className: 'field-group video-url' },
          label {},'External Video URL'
          input {
            className: 'bordered-input'
            placeholder: 'Enter a link'
            defaultValue: @state.video_url_external
            onChange: @onInputChange
            name: 'video_url_external'
          }
      div { className: 'field-group' },
        label {},
          span {}, 'Description'
          span { className: 'subtitle' }, 'Accepts Markdown'
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
              { id: r.id, value: r.name }
            selected: (e, item, items) =>
              @onChange 'artist_ids', items
            removed: (e, item, items) =>
              @onChange 'artist_ids', _.without(items, item)
            idsToFetch: _.pluck @state.artist_ids, 'id'
            fetchUrl: (id) -> "#{sd.ARTSY_URL}/api/v1/artist/#{id}"
            resObject: (res) ->
              id: res.body.id, value: res.body.name
          }

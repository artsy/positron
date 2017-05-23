React = require 'react'
ReactDOM = require 'react-dom'
Verticals = require '../../../../../collections/verticals.coffee'
AutocompleteList = React.createFactory require '../../../../../components/autocomplete_list/index.coffee'
{ div, section, label, button, input } = React.DOM

module.exports = React.createClass
  displayName: 'AdminVerticalsTags'

  getInitialState: ->
    vertical: null or @props.article.get('vertical')
    verticals: []

  componentDidMount: ->
    ReactDOM.findDOMNode(@refs.container).classList += ' active'
    @fetchVerticals()

  fetchVerticals: ->
    new Verticals().fetch
      cache: true
      success: (verticals) =>
        sortedVerticals = verticals.sortBy('name')
        @setState verticals: sortedVerticals

  printVerticals: (verticals, handleToggle) ->
    verticals.map (vertical, i) =>
      active = ''
      if @state.vertical?.name is vertical.get 'name'
        active = ' avant-garde-button-black'
      button {
        key: i
        name: vertical.get 'name'
        onClick: handleToggle
        className: 'avant-garde-button' + active
      }, vertical.get 'name'
    , @

  verticalToggle: (e) ->
    verticals = new Verticals @state.verticals
    active = _.first verticals.where name: e.target.name
    newVertical =
      name: active.get 'name'
      id: active.get 'id'
    newVertical = null if newVertical.name is @state.vertical?.name
    @setState vertical: newVertical
    @props.onChange('vertical', newVertical)

  render: ->
    section { className: 'edit-admin--verticals-tags edit-admin__fields', ref: 'container'},
      div {className: 'fields-left'},
        div { className: 'field-group' },
          label {}, 'Editorial Vertical'
          @printVerticals @state.verticals, @verticalToggle

      div {className: 'fields-right'},
        div {className: 'field-group'},
          label {}, 'Topic Tags'
          AutocompleteList {
            url: "#{sd.API_URL}/tags?public=true&q=%QUERY"
            placeholder: 'Start typing a topic tag...'
            idsToFetch: @props.article.get 'tags'
            inline: true
            filter: (tags) ->
              for tag in tags.results
                { id: tag.id, value: "#{tag.name}"}
            selected: (e, item, items) =>
              newTags = _.pluck items, 'value'
              @props.onChange 'tags', newTags
            removed: (e, item, items) =>
              newTags = _.without @props.article.get('tags'), item.value
              @props.onChange 'tags', newTags
            fetchUrl: (name) -> "#{sd.API_URL}/tags?public=true&q=#{name}"
            resObject: (res) ->
              return unless res.body.results.length
              id: res.body.results[0].id, value: "#{res.body.results[0].name}"
          }

        div {className: 'field-group'},
          label {}, 'Tracking Tags'
          AutocompleteList {
            url: "#{sd.API_URL}/tags?public=false&q=%QUERY"
            placeholder: 'Start typing a tracking tag...'
            idsToFetch: @props.article.get 'tracking_tags'
            inline: true
            filter: (tracking_tags) ->
              for tracking_tag in tracking_tags.results
                { id: tracking_tag.id, value: "#{tracking_tag.name}"}
            selected: (e, item, items) =>
              newTags = _.pluck items, 'value'
              @props.onChange 'tracking_tags', newTags
            removed: (e, item, items) =>
              newTags = _.without @props.article.get('tracking_tags'), item.value
              @props.onChange 'tracking_tags', newTags
            fetchUrl: (name) -> "#{sd.API_URL}/tags?public=false&q=#{name}"
            resObject: (res) ->
              return unless res.body.results.length
              id: res.body.results[0].id, value: "#{res.body.results[0].name}"
          }

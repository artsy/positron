React = require 'react'
ReactDOM = require 'react-dom'
Verticals = require '../../../../../collections/verticals.coffee'
AutocompleteList = React.createFactory require '../../../../../components/autocomplete_list/index.coffee'
{ div, section, label, button, input } = React.DOM

module.exports = React.createClass
  displayName: 'AdminVerticalsTags'

  getInitialState: ->
    vertical: null || @props.article.get('vertical')
    verticals: []

  componentDidMount: ->
    ReactDOM.findDOMNode(@refs.container).classList += ' active'
    @fetchVerticals()
    @formatTags()

  fetchVerticals: ->
    new Verticals().fetch
      data: limit: 10
      success: (verticals) =>
        sortedVerticals = verticals.sortBy('name')
        @setState verticals: sortedVerticals

  printButtons: (buttons, handleToggle) ->
    buttons.map (vertical, i) =>
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
    @setState vertical: newVertical
    @props.onChange('vertical', newVertical)

  onAddTag: (value) ->
    tags = _.uniq @props.article.get('tags').concat(value)
    @formatTags()
    @props.onChange('tags', tags)

  formatTags: ->
    $('.edit-admin--verticals-tags .autocomplete-container').each (i, container) ->
      input = $(container).find('.autocomplete-input.tt-input')
      selected = $(container).find('.autocomplete-selected').width() + 10
      $(input).css('padding-left', selected)

  render: ->
    section { className: 'edit-admin--verticals-tags edit-admin__fields', ref: 'container'},
      div {className: 'fields-left'},
        div { className: 'field-group' },
          label {}, 'Editorial Vertical'
          @printButtons @state.verticals, @verticalToggle

      div {className: 'fields-right'},
        div {className: 'field-group'},
          label {}, 'Topic Tags'
          AutocompleteList {
            url: "#{sd.API_URL}/tags?public=true&q=%QUERY"
            placeholder: 'Start typing a topic tag...'
            idsToFetch: @props.article.get 'tags'
            filter: (tags) ->
              for tag in tags.results
                { id: tag.id, value: "#{tag.name}"}
            selected: (e, item, items) =>
              tags = _.pluck items, 'value'
              @onAddTag tags
            removed: (e, item, items) =>
              tags = _.uniq @props.article.get 'tags'
              newTags = _.without(tags,item.value)
              @formatTags()
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
            idsToFetch: @props.article.get 'tags'
            filter: (tags) ->
              for tag in tags.results
                { id: tag.id, value: "#{tag.name}"}
            selected: (e, item, items) =>
              tags = _.pluck items, 'value'
              @onAddTag tags
            removed: (e, item, items) =>
              tags = _.uniq @props.article.get 'tags'
              newTags = _.without(tags,item.value)
              @formatTags()
              @props.onChange 'tags', newTags
            fetchUrl: (name) -> "#{sd.API_URL}/tags?public=false&q=#{name}"
            resObject: (res) ->
              return unless res.body.results.length
              id: res.body.results[0].id, value: "#{res.body.results[0].name}"
          }

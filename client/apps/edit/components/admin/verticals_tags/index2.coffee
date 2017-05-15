React = require 'react'
ReactDOM = require 'react-dom'
AutocompleteList = React.createFactory require '../../../../../components/autocomplete_list/index.coffee'
{ div, section, label, button, input } = React.DOM

module.exports = React.createClass
  displayName: 'AdminVerticalsTags'

  getInitialState: ->
    vertical: null
    verticals: ['Art', 'Art Market', 'Culture', 'Creativity']

  componentDidMount: ->
    ReactDOM.findDOMNode(@refs.container).classList += ' active'

  printButtons: (buttons, handleToggle) ->
    buttons.map (tag, i) =>
      active = ''
      if @state.vertical is tag
        active = ' avant-garde-button-black'
      button {
        key: i
        name: tag
        onClick: handleToggle
        className: 'avant-garde-button' + active
      }, tag
    , @

  verticalToggle: (e) ->
    active = @state.verticals.indexOf e.target.name
    @setState vertical: e.target.name

  onAddTag: (value) ->
    tags = _.uniq @props.article.get('tags').concat(value)
    @props.onChange('tags', tags)

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
              @props.onChange 'tags', newTags
            fetchUrl: (id) -> "#{sd.API_URL}/tags?public=true&q=#{id}"
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
              @props.onChange 'tags', newTags
            fetchUrl: (id) -> "#{sd.API_URL}/tags?public=false&q=#{id}"
            resObject: (res) ->
              return unless res.body.results.length
              id: res.body.results[0].id, value: "#{res.body.results[0].name}"
          }
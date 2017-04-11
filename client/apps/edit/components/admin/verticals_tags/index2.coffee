React = require 'react'
ReactDOM = require 'react-dom'
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

  render: ->
    section { className: 'edit-admin--verticals-tags edit-admin__fields', ref: 'container'},
      div {className: 'fields-left'},
        div { className: 'field-group' },
          label {}, 'Editorial Vertical'
          @printButtons @state.verticals, @verticalToggle

      div {className: 'fields-right'},
        div {className: 'field-group'},
          label {}, 'Topic Tags'
          input {
            className: 'bordered-input'
            placeholder: 'Start typing a topic tag...'
          }
        div {className: 'field-group'},
          label {}, 'Tracking Tags'
          input {
            className: 'bordered-input'
            placeholder: 'Start typing a tracking tag...'
          }
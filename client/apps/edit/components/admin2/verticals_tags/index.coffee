React = require 'react'
ReactDOM = require 'react-dom'
{ div, label, button, input } = React.DOM


VERTICALS = ['Art', 'Art Market', 'Culture', 'Creativity']
SUBVERTICALS = [
  ['Art World', 'Art History', 'Artists']
  ['Collecting', 'Market Analysis', 'Art Industry']
  ['Visual Culture', 'Photography', 'Politics', 'Architecture', 'Design']
  ['Innovation', 'Inspiration', 'Business', 'Wellness']
]

module.exports = React.createClass
  displayName: 'AdminVerticals'

  getInitialState: ->
    vertical: null
    subVerticals: null
    subVertical: null

  printButtons: (buttons, handleToggle) ->
    if buttons
      buttons.map (tag, i) =>
        active = ''
        if @state.vertical is tag or @state.subVertical is tag
          active = ' avant-garde-button-black'
        button {
          key: i
          name: tag
          onClick: handleToggle
          className: 'avant-garde-button' + active
        }, tag
      , @
    else
      button {
        className: 'avant-garde-button disabled'
        }, 'Please select a vertical first'

  subVerticalToggle: (e)->
    @setState subVertical: e.target.name

  verticalToggle: (e) ->
    active = VERTICALS.indexOf e.target.name
    @setState
      vertical: e.target.name
      subVerticals: SUBVERTICALS[active]

  render: ->
    div { className: 'edit-admin--verticals-tags edit-admin__fields'},
      div {className: 'fields-left'},
        div { className: 'field-group' },
          label {}, 'Editorial Vertical'
          @printButtons VERTICALS, @verticalToggle
        div { className: 'field-group' },
          label {}, 'Editorial SubVertical'
          @printButtons @state.subVerticals, @subVerticalToggle
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
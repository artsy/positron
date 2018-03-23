React = require 'react'
ReactDOM = require 'react-dom'
{ div, input, button } = React.DOM

module.exports = AddTag = React.createClass
  displayName: 'TagsView'

  getInitialState: ->
    value: ''

  addTag: ->
    @props.addTag @state.value
    @setState value: ''

  handleChange: (e) ->
    @setState value: e.target.value

  handleKeyPress: (target) ->
    if target.charCode is 13
      @addTag()

  render: ->
    div { className: 'tags-panel__add' },
      input {
        className: 'bordered-input'
        placeholder: 'Enter tag title...'
        value: @state.value
        onChange: @handleChange
        onKeyPress: @handleKeyPress
      }
      button {
        className: 'avant-garde-button avant-garde-button-black'
        onClick: @addTag
      }, "Add"
React = require 'react'
ReactDOM = require 'react-dom'
{ div, input, button } = React.DOM

module.exports = AddTag = React.createClass
  displayName: 'TagsView'

  addTag: ->
    @props.addTag @refs.addTagInput.value
    @refs.addTagInput.value = ''

  render: ->
    div { className: 'tags-panel__add' },
      input {
        className: 'bordered-input'
        ref: 'addTagInput'
        placeholder: 'Enter tag title...'
      }
      button {
        className: 'avant-garde-button avant-garde-button-black'
        onClick: @addTag
      }, "Add"
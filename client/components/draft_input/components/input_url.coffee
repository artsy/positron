React = require 'react'
{ div, button, input } = React.DOM
icons = -> require('../icons.jade') arguments...

module.exports = React.createClass
  displayName: 'DraftInputUrl'

  getInitialState: ->
    urlValue: ''

  onURLChange: (e) ->
    @setState urlValue: e.target.value

  removeLink: ->

  confirmLink: ->

  render: ->
    div {
      className: 'draft-caption__url-input draft-input--url'
    },
      input {
        ref: 'url'
        type: 'text'
        value: @state.urlValue
        onChange: @onURLChange
        className: 'bordered-input'
        placeholder: 'Paste or type a link'
        onKeyPress: @props.handleLinkReturn
      }
      if @state.urlValue?.length
        button {
          className: 'remove-link'
          onMouseDown: @removeLink
          dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
        }
      button {
        className: 'add-link'
        onMouseDown: @confirmLink
      }, 'Apply'

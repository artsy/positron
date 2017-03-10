# A pop-up input for adding a link to a text selection

# Example usage:
# DraftInputUrl {
#   selectionTarget: selectionTarget <- where the input should be placed {top, left}
#   removeLink: @removeLink
#   confirmLink: @confirmLink
#   urlValue: urlValue <- to edit an existing link, pass url of selection
# }
React = require 'react'
{ div, button, input } = React.DOM
icons = -> require('../icons.jade') arguments...

module.exports = React.createClass
  displayName: 'DraftInputUrl'

  getInitialState: ->
    urlValue: ''

  componentDidMount: ->
    @refs.url.focus()

  onChange: ->
    @setState urlValue: @refs.url.value

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
        onKeyUp: @handleLinkReturn
        onBlur: @props.removeLink
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

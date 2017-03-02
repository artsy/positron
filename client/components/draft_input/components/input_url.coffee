# A pop-up input for adding a link to a text selection

# Example usage:
# DraftInputUrl {
#   selectionTarget: selectionTarget <- where the input should be placed {top, left}
#   removeLink: @removeLink
#   confirmLink: @confirmLink
#   urlValue: urlValue <- to editing an existing link, pass url of selection
# }
React = require 'react'
icons = -> require('../icons.jade') arguments...
{ div, button, input } = React.DOM

module.exports = React.createClass
  displayName: 'DraftInputUrl'

  getInitialState: ->
    urlValue: @props.urlValue || ''

  onChange: ->
    @setState urlValue: @refs.url.value

  confirmLink: (e) ->
    e.preventDefault()
    if @state.urlValue.length
      @props.confirmLink(@state.urlValue)
    else
      @props.removeLink(e)

  removeLink: (e) ->
    e.preventDefault()
    @props.removeLink(e)

  handleLinkReturn: (e) ->
    e.preventDefault()
    if e.key is 'Enter'
      @confirmLink(e)

  render: ->
    div {
      className: 'draft-caption__url-input'
      style: {
        top: @props.selectionTarget.top || 0
        left: @props.selectionTarget.left || 0
      }
    },
      input {
        ref: 'url'
        type: 'text'
        value: @state.urlValue
        onChange: @onChange
        className: 'bordered-input'
        placeholder: 'Paste or type a link'
        onKeyUp: @handleLinkReturn
      }
      if @state.urlValue?.length
        button {
          className: 'remove-link'
          onMouseDown: @props.removeLink
          dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
        }
      button {
        className: 'add-link'
        onMouseDown: @confirmLink
      }, 'Apply'


# A pop-up input for adding a link to a text selection

# Example usage:
# InputUrl {
#   selectionTarget: selectionTarget <- where the input should be placed {top, left}
#   removeLink: @removeLink
#   confirmLink: @confirmLink
#   urlValue: urlValue <- to edit an existing link, pass url of selection
# }
React = require 'react'
{ div, button, input } = React.DOM
icons = -> require('../icons.jade') arguments...

module.exports = React.createClass
  displayName: 'RichTextInputUrl'

  getInitialState: ->
    urlValue: @props.urlValue || ''

  componentDidMount: ->
    @refs.url.focus()

  onChange: ->
    @setState urlValue: @refs.url.value

  confirmLink: (e) ->
    e.preventDefault()
    if @state.urlValue.length isnt 0
      @props.confirmLink(@state.urlValue, @props.pluginType)
    else
      @props.removeLink(e)

  handleLinkReturn: (e) ->
    e.preventDefault()
    if e.key is 'Enter'
      @confirmLink(e)

  render: ->
    div {
      className: 'rich-text--url-input'
      style: {
        top: @props.selectionTarget?.top || 0
        left: @props.selectionTarget?.left || 0
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
        onBlur: @confirmLink
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

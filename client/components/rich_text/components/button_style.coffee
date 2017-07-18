React = require 'react'
{ div, button } = React.DOM
icons = -> require('../utils/icons.jade') arguments...

module.exports = React.createClass
  displayName: 'RichTextButtonStyle'

  onToggle: (e) ->
    e.preventDefault()
    name = if e.target.name then e.target.name else $(e.target).closest('button').attr('name')
    @props.onToggle name

  render: ->
    if @props.label in ['UL','OL', 'artist', 'link', 'remove-formatting']
      name = '.' + @props.name
      button {
        onMouseDown: @onToggle
        name: @props.name
        className: @props.name
        dangerouslySetInnerHTML: __html: $(icons()).filter(name).html()
      }
    else
      button {
        onMouseDown: @onToggle
        name: @props.name
        className: @props.name
      }, @props.label
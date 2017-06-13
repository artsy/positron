React = require 'react'
{ div } = React.DOM

module.exports = React.createClass
  displayName: 'DragSource'

  setDragSource: ->
    @props.setDragSource(@props.i)

  render: ->
    div {
      className: 'drag-source'
      draggable: @props.isDraggable
      onDragStart: @setDragSource
      onDragEnd: @props.onDragEnd
      'data-source': @props.activeSource
    },
      @props.children
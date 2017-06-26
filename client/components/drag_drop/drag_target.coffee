React = require 'react'
{ div } = React.DOM

module.exports = React.createClass
  displayName: 'DragTarget'

  setDragTarget: (e) ->
    unless @props.i is @props.activeTarget
      @props.setDragTarget(@props.i)

  render: ->
    div {
      className: 'drag-target'
      onDragOver: @setDragTarget
      'data-target': @props.activeTarget
      style:
        width: @props.width or '100%'
    },
      if @props.activeTarget and @props.isDraggable
        div { className: 'drag-placeholder' }
      @props.children
React = require 'react'
{ div } = React.DOM

module.exports = React.createClass
  displayName: 'DragTarget'

  setDragTarget: (e) ->
    unless @props.i is @props.activeTarget
      @props.setDragTarget(@props.i)

  setWidth: ->
    if @props.width?[@props.i]
      return @props.width[@props.i].width
    else
      return '100%'

  render: ->
    div {
      className: 'drag-target'
      onDragOver: @setDragTarget
      'data-target': @props.activeTarget
      style:
        width: @setWidth()
    },
      if @props.activeTarget and @props.isDraggable
        div { className: 'drag-placeholder' }
      @props.children
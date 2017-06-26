React = require 'react'
{ div } = React.DOM

module.exports = React.createClass
  displayName: 'DragSource'

  setDragSource: (e) ->
    unless !@props.isDraggable
      dragStartY = e.clientY - ($(e.currentTarget).position().top - window.scrollY)
      dragHeight = $(e.currentTarget).height()
      @props.setDragSource(@props.i, dragHeight, dragStartY)

  render: ->
    div {
      className: 'drag-source'
      draggable: @props.isDraggable
      onDragStart: @setDragSource
      onDragEnd: @props.onDragEnd
      'data-source': @props.activeSource
    },
      @props.children
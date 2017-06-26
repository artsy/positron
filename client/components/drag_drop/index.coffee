React = require 'react'
_ = require 'underscore'
DragTarget = React.createFactory require './drag_target.coffee'
DragSource = React.createFactory require './drag_source.coffee'
{ div } = React.DOM

module.exports = React.createClass
  displayName: 'DragContainer'

  getInitialState: ->
    dragSource: null
    dragTarget: null
    dragStartY: null
    draggingHeight: 0

  setDragSource: (index, draggingHeight, clientY) ->
    @setState
      dragSource: index
      dragStartY: clientY
      draggingHeight: draggingHeight

  setDragTarget: (index) ->
    @setState dragTarget: index

  onDragEnd: ->
    newItems = @props.items
    moved = newItems.splice @state.dragSource, 1
    newItems.splice @state.dragTarget, 0, moved[0]
    unless @state.dragSource is @state.dragTarget
      @props.onDragEnd(newItems)
    @setState
      dragSource: null
      dragTarget: null
      dragStartY: null
      draggingHeight: 0

  render: ->
    children = React.Children.toArray(@props.children)

    div { className: 'drag-container' },
      children.map (child, i) =>
        if child.type.displayName is 'SectionTool' or !@props.isDraggable
          child
        else
          i = child.props.index or i
          DragTarget {
            key: i
            i: i
            setDragTarget: @setDragTarget
            activeSource: @state.dragSource is i
            activeTarget: @state.dragTarget is i
            isDraggable: @props.isDraggable
            width: @props.dimensions?[i]?.width
          },
            DragSource {
              i: i
              setDragSource: @setDragSource
              activeSource: @state.dragSource is i
              activeTarget: @state.dragTarget is i
              onDragEnd: @onDragEnd
              isDraggable: @props.isDraggable
            },
              child

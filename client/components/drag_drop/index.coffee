React = require 'react'
_ = require 'lodash'
DragTarget = React.createFactory require './drag_target.coffee'
DragSource = require('./drag_source.jsx').DragSource
{ div } = React.DOM

module.exports = React.createClass
  displayName: 'DragContainer'

  getInitialState: ->
    dragSource: null
    dragTarget: null
    dragStartY: null
    draggingHeight: 0
    dropPosition: 'top'

  setDragSource: (index, draggingHeight, clientY) ->
    @setState
      dragSource: index
      dragStartY: clientY
      draggingHeight: draggingHeight

  setDragTarget: (index, $dragTarget, mouseY) ->
    if @state.dragSource or @state.dragSource is 0
      @setState
        dragTarget: index
        dropPosition: @setDropZonePosition($dragTarget, index, mouseY)

  setDropZonePosition: ($dragTarget, dragTargetId, mouseY) ->
    return 'top' if @props.layout != 'vertical'
    dragTargetTop = $dragTarget.position().top + 20 - window.scrollY
    dragTargetCenter = dragTargetTop + ($dragTarget.height() / 2)
    mouseBelowCenter = mouseY > dragTargetCenter
    dragTargetIsNext = dragTargetId is @state.dragSource + 1
    dragTargetNotFirst = dragTargetId != 0
    dragSourceNotLast = @state.dragSource != @props.children.length - 1

    if (dragTargetNotFirst and dragSourceNotLast and mouseBelowCenter) or dragTargetIsNext
      dropZonePosition = 'bottom'
    else
      dropZonePosition = 'top'
    dropZonePosition

  onDragEnd: ->
    newItems = _.clone(@props.items)
    moved = newItems.splice @state.dragSource, 1
    newItems.splice @state.dragTarget, 0, moved[0]

    if @state.dragSource != @state.dragTarget
      @props.onDragEnd(newItems)
    @setState
      dragSource: null
      dragTarget: null
      dragStartY: null
      draggingHeight: 0

  setTargetWidth: (i) ->
    if @props.isWrapping
      return @props.dimensions?[i]?.width * 2
    else
      return @props.dimensions?[i]?.width

  render: ->
    children = React.Children.toArray(@props.children)

    div { className: 'drag-container' },
      children.map (child, i) =>
        if child.props.isDraggable is false or !@props.isDraggable
          child
        else
          type = child.props.section?.type or null
          if child.type.displayName is 'SectionContainer'
            layout = child.props.section?.layout or 'column_width'

          DragTarget {
            key: i + '-' + child.type.displayName + '-target'
            i: i
            setDragTarget: @setDragTarget
            activeSource: @state.dragSource is i
            activeTarget: @state.dragTarget is i
            isDraggable: @props.isDraggable
            width: @setTargetWidth(i)
            height: if @props.layout is 'vertical' then @state.draggingHeight else null
            vertical: if @props.layout is 'vertical' then true else false
            dropPosition: @state.dropPosition
            dragStartY: @state.dragStartY
            type: type
            layout: layout or null
          },
            React.createElement(
              DragSource, {
                index: i
                key: i + child.type.displayName + '-source'
                setDragSource: @setDragSource
                activeSource: @state.dragSource is i
                activeTarget: @state.dragTarget is i
                onDragEnd: @onDragEnd
                isDraggable: @props.isDraggable
              },
                child
            )

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
    newItems = @props.items
    moved = newItems.splice @state.dragSource, 1
    newItems.splice @state.dragTarget, 0, moved[0]
    if @state.dragSource != @state.dragTarget
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
          type = child.props.section?.get('type') or null
          if child.type.displayName is 'SectionContainer'
            layout = child.props.section.getLayout(@props.article?.get('layout'))
          DragTarget {
            key: i
            i: i
            setDragTarget: @setDragTarget
            activeSource: @state.dragSource is i
            activeTarget: @state.dragTarget is i
            isDraggable: @props.isDraggable
            width: @props.dimensions?[i]?.width
            height: if @props.layout is 'vertical' then @state.draggingHeight else null
            vertical: if @props.layout is 'vertical' then true else false
            dropPosition: @state.dropPosition
            dragStartY: @state.dragStartY
            type: type
            layout: layout or null
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

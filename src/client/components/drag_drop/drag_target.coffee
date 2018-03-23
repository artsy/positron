React = require 'react'
_ = require 'underscore'
{ div } = React.DOM

module.exports = React.createClass
  displayName: 'DragTarget'

  componentWillMount: ->
    @debouncedDragTarget = _.debounce((($dragTarget, mouseY) =>
      $dragTarget = $(@refs.target)
      @props.setDragTarget(@props.i, $dragTarget, mouseY)
    ), 3)

  setDragTarget: (e) ->
    unless @props.i is @props.activeTarget
      mouseY = e.clientY - @props.dragStartY
      @debouncedDragTarget(mouseY)

  renderDropZone: ->
    verticalClass = if @props.vertical then ' vertical' else ''
    if @props.activeTarget and @props.isDraggable
      div {
        className: 'drag-placeholder' + verticalClass
        style:
          height: @props.height or 'auto'
      }

  render: ->
    div {
      ref: 'target'
      className: 'drag-target'
      onDragOver: @setDragTarget
      'data-target': @props.activeTarget
      'data-source': @props.activeSource
      'data-type': @props.type
      'data-layout': @props.layout or ''
      style:
        width: @props.width or '100%'
    },
      @renderDropZone() if @props.dropPosition is 'top'
      @props.children
      @renderDropZone() if @props.dropPosition is 'bottom'

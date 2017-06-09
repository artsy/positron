React = require 'react'
ItemTypes = require('../drag_constants.coffee').ItemTypes
didDrop = require('../drag_constants.coffee').didDrop
DropTarget = require('react-dnd').DropTarget
{ div } = React.DOM


itemTarget = {
  drop: (props, monitor, component) =>
    dragTarget = props.children.props.children.props.index
    props.onDragEnd dragTarget
    dragTarget
}

collect = (connect, monitor) =>
  return {
    connectDropTarget: connect.dropTarget()
    isOver: monitor.isOver()
    canDrop: monitor.canDrop()
    itemType: monitor.getItemType()
  }

DragTarget = React.createClass
  displayName: 'DragTarget'

  render: ->
    @props.connectDropTarget(
      div { className: 'drag-target'},
        @props.children
        if @props.isOver
          div {}, 'CAN DROP'
    )

module.exports = DropTarget(ItemTypes.DRAGGABLE_ITEM, itemTarget, collect)(DragTarget)



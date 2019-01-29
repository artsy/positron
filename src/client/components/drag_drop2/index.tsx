import { Flex } from "@artsy/palette"
import { cloneDeep } from "lodash"
import React from "react"
import styled from "styled-components"
import { DragSource } from "./drag_source"
import { DragTarget } from "./drag_target"

interface DragDropListProps {
  children: any
  items: any[]
  dimensions?: DragItemDimensions[]
  isDraggable: boolean
  isVertical?: boolean
  isWrapping?: boolean
  onDragEnd: (items: any[]) => void
}

export type DropPosition = "top" | "bottom"

interface DragItemDimensions {
  width: number
}

interface DragDropListState {
  dragSource: number | null
  dragTarget: any
  dragStartY: number
  draggingHeight: number
  dropPosition: DropPosition
}

export class DragDropList extends React.Component<
  DragDropListProps,
  DragDropListState
> {
  state = {
    dragSource: null,
    dragTarget: null,
    dragStartY: 0,
    draggingHeight: 0,
    dropPosition: "top" as DropPosition,
  }
  static defaultProps = {
    isDraggable: true,
  }

  setDragSource = (index, draggingHeight, dragStartY) => {
    console.log("started dragging", index)
    this.setState({
      dragSource: index,
      dragStartY,
      draggingHeight,
    })
  }

  setDragTarget = (index, $dragTarget, mouseY) => {
    const { dragSource } = this.state
    if (dragSource || dragSource === 0) {
      const dropPosition = this.setDropZonePosition($dragTarget, index, mouseY)
      console.log("dragging over", index)
      this.setState({
        dragTarget: index,
        dropPosition,
      })
    }
  }

  setDropZonePosition = ($dragTarget, dragTargetId, mouseY) => {
    const { children, isVertical } = this.props
    const { dragSource } = this.state
    let dropZonePosition: DropPosition = "top"

    if (!isVertical) {
      return dropZonePosition
    }

    const dragTargetTop = $dragTarget.position().top + 20 - window.scrollY
    const dragTargetCenter = dragTargetTop + $dragTarget.height() / 2
    const mouseBelowCenter = mouseY > dragTargetCenter
    const dragTargetIsNext = dragSource && dragTargetId === dragSource + 1
    const dragTargetNotFirst = dragTargetId !== 0
    const dragSourceNotLast = dragSource !== children.length - 1
    const isBelow = dragTargetNotFirst && dragSourceNotLast && mouseBelowCenter

    if (isBelow || dragTargetIsNext) {
      dropZonePosition = "bottom"
    }
    return dropZonePosition
  }

  onDragEnd = () => {
    const { items, onDragEnd } = this.props
    const { dragSource, dragTarget } = this.state
    const newItems = cloneDeep(items)

    if (
      (dragSource || dragSource === 0) &&
      (dragTarget || dragTarget === 0) &&
      dragSource !== dragTarget
    ) {
      const movedItem = newItems.splice(dragSource, 1)
      newItems.splice(dragTarget, 0, movedItem[0])
      onDragEnd(newItems)

      this.setState({
        dragSource: null,
        dragTarget: null,
        dragStartY: 0,
        draggingHeight: 0,
      })
    }
  }

  setTargetWidth = i => {
    const { dimensions, isWrapping } = this.props
    if (!dimensions) {
      return
    }
    const itemDimensions = dimensions[i].width

    if (isWrapping) {
      return itemDimensions * 2
    } else {
      return itemDimensions
    }
  }

  render() {
    const { children, isDraggable, isVertical } = this.props
    const {
      draggingHeight,
      dragSource,
      dragTarget,
      dragStartY,
      dropPosition,
    } = this.state
    return (
      <DragContainer flexDirection="column">
        {children.map((child, i) => {
          if (!isDraggable || !child.props.isDraggable) {
            return <div key={i}>{child}</div>
          } else {
            return (
              <DragTarget
                key={i}
                index={i}
                isActiveSource={dragSource === i}
                isActiveTarget={dragTarget === i}
                isDraggable={isDraggable}
                isVertical={isVertical}
                setDragTarget={this.setDragTarget}
                dragStartY={dragStartY}
                dropPosition={dropPosition}
                height={isVertical ? draggingHeight : undefined}
                width={this.setTargetWidth(i)}
              >
                <DragSource
                  isActiveSource={dragSource === i}
                  index={i}
                  onDragEnd={this.onDragEnd}
                  setDragSource={this.setDragSource}
                  isDraggable
                >
                  {child}
                </DragSource>
              </DragTarget>
            )
          }
        })}
      </DragContainer>
    )
  }
}

export const DragContainer = styled(Flex)`
  width: 100%;
  position: relative;
`

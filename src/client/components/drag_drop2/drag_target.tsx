import { debounce } from "lodash"
import React from "react"
import styled from "styled-components"

interface DragTargetProps {
  isActiveTarget?: boolean
  isActiveSource?: boolean
  children?: any
  dragStartY: number
  dropPosition?: "top" | "bottom"
  height?: number
  index: number
  isDraggable?: boolean
  isVertical?: boolean
  width?: number
  setDragTarget: (index: number, target: any, mouseY: number) => void
}

export class DragTarget extends React.Component<DragTargetProps> {
  public debouncedDragTarget
  public target

  componentWillMount() {
    const { setDragTarget, index } = this.props

    this.debouncedDragTarget = debounce(($dragTarget, mouseY) => {
      $dragTarget = $(this.target)
      setDragTarget(index, $dragTarget, mouseY)
    }, 3)
  }

  setDragTarget = e => {
    const { isActiveTarget, dragStartY } = this.props
    if (!isActiveTarget) {
      const mouseY = e.clientY - dragStartY
      this.debouncedDragTarget(mouseY)
    }
  }

  renderDropZone = () => {
    const {
      isVertical,
      isDraggable,
      isActiveSource,
      isActiveTarget,
      height,
    } = this.props

    if (isActiveTarget && isDraggable && !isActiveSource) {
      return <DragPlaceholder isVertical={isVertical} height={height} />
    }
  }

  render() {
    const {
      isActiveSource,
      isActiveTarget,
      dropPosition,
      isVertical,
    } = this.props
    return (
      <DragTargetContainer
        innerRef={ref => (this.target = ref)}
        isActiveSource={isActiveSource}
        isActiveTarget={isActiveTarget}
        onDragOver={this.setDragTarget}
        isVertical={isVertical}
      >
        {dropPosition === "top" && this.renderDropZone()}
        {this.props.children}
        {dropPosition === "bottom" && this.renderDropZone()}
      </DragTargetContainer>
    )
  }
}

const DragPlaceholder = styled.div.attrs<{
  height?: number
  isVertical?: boolean
}>({})`
  border: 2px dashed gray;
  height: ${props => (props.height ? `${props.height}px` : "auto")};
  min-height: 2em;
  background-color: white;
  width: 100%;
  ${props =>
    !props.isVertical &&
    `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
  `};
`

export const DragTargetContainer = styled.div.attrs<{
  isActiveSource?: boolean
  isActiveTarget?: boolean
  isVertical?: boolean
  width?: number
}>({})`
  position: relative;
  width: ${props => (props.width ? props.width : "100%")};
`

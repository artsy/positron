import { color } from "@artsy/palette"
import { RemoveButtonContainer } from "client/components/remove_button"
import { debounce } from "lodash"
import React from "react"
import { findDOMNode } from "react-dom"
import styled from "styled-components"

interface DragTargetProps {
  isActiveTarget: boolean
  isActiveSource: boolean
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

  constructor(props) {
    super(props)
    const { setDragTarget, index } = props

    this.debouncedDragTarget = debounce(mouseY => {
      const target = findDOMNode(this.target) as Element
      const dragTarget: ClientRect = target.getBoundingClientRect()
      setDragTarget(index, dragTarget, mouseY)
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
    const { isActiveSource, isActiveTarget } = this.props
    const dropPosition = this.props.dropPosition || "top"

    return (
      <DragTargetContainer
        ref={ref => (this.target = ref)}
        isActiveSource={isActiveSource}
        isActiveTarget={isActiveTarget}
        onDragOver={this.setDragTarget}
      >
        {dropPosition === "top" && this.renderDropZone()}
        {this.props.children}
        {dropPosition === "bottom" && this.renderDropZone()}
      </DragTargetContainer>
    )
  }
}

export const DragPlaceholder = styled.div<{
  height?: number
  isVertical?: boolean
}>`
  border: 2px dashed ${color("black10")};
  height: ${props => (props.height ? `${props.height}px` : "auto")};
  min-height: 1em;
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

export const DragTargetContainer = styled.div<{
  isActiveSource: boolean
  isActiveTarget: boolean
  width?: number
}>`
  position: relative;
  width: ${props => (props.width ? props.width : "100%")};

  ${RemoveButtonContainer} {
    ${props =>
      (props.isActiveSource || props.isActiveTarget) &&
      `

      display: none;
  `};
  }
`

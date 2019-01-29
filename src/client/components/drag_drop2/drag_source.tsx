import React from "react"
import { findDOMNode } from "react-dom"
import styled from "styled-components"

interface DragSourceProps {
  isActiveSource?: boolean
  children: any
  isDraggable?: boolean
  index: number
  onDragEnd: () => void
  setDragSource: (i: number, height: number, startY: number) => void
}

export class DragSource extends React.Component<DragSourceProps> {
  public source

  setDragSource = e => {
    const { isDraggable, index, setDragSource } = this.props
    console.log("in source")
    const dragSource = findDOMNode(this.source).getBoundingClientRect()

    if (isDraggable) {
      const dragStartY = e.clientY - (dragSource.top - window.scrollY)
      const dragSourceHeight = dragSource.bottom - dragSource.top
      console.log("in source, setting drag source")
      setDragSource(index, dragSourceHeight, dragStartY)
    }
  }

  render() {
    const { isActiveSource, children, isDraggable, onDragEnd } = this.props

    return (
      <DragSourceContainer
        innerRef={ref => (this.source = ref)}
        isActiveSource={isActiveSource}
        isDraggable={isDraggable}
        onDragEnd={onDragEnd}
        onDragStart={this.setDragSource}
      >
        <ChildContainer>{children}</ChildContainer>
      </DragSourceContainer>
    )
  }
}

const DragSourceContainer = styled.div.attrs<{
  isDraggable?: boolean
  isActiveSource?: boolean
}>({})`
  z-index: 1;
  position: relative;
  background: orange;

  ${props =>
    props.isActiveSource &&
    `
    cursor: ns-resize;
  `};
`

const ChildContainer = styled.div`
  opacity: 0.99;
  z-index: -1;
  position: relative;
`

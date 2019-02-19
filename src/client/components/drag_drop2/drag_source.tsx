import React from "react"
import { findDOMNode } from "react-dom"
import styled from "styled-components"

interface DragSourceProps {
  isActiveSource: boolean
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
    const dragSource = findDOMNode(this.source).getBoundingClientRect()

    if (isDraggable) {
      const dragStartY = e.clientY - (dragSource.top - window.scrollY)
      const dragSourceHeight = dragSource.bottom - dragSource.top
      setDragSource(index, dragSourceHeight, dragStartY)
    }
  }

  render() {
    const { isActiveSource, children, onDragEnd } = this.props

    return (
      <DragSourceContainer
        ref={ref => (this.source = ref)}
        isActiveSource={isActiveSource}
        onDragEnd={onDragEnd}
        onDragStart={this.setDragSource}
      >
        {children}
        <DraggableCover
          onDragEnd={onDragEnd}
          onDragStart={this.setDragSource}
        />
      </DragSourceContainer>
    )
  }
}

export const DragSourceContainer = styled.div<{
  isActiveSource?: boolean
}>`
  z-index: 1;
  position: relative;
  background: white;

  ${props =>
    props.isActiveSource &&
    `
    cursor: grab;
  `};
`

export const DraggableCover = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
`

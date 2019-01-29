import React from "react"
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
  setDragSource = e => {
    const { isDraggable, index, setDragSource } = this.props
    const { clientY, currentTarget } = e
    console.log("in source")
    if (isDraggable) {
      const dragStartY =
        clientY - ($(currentTarget).position().top - window.scrollY)
      const dragHeight = $(currentTarget).height()
      console.log("in source, setting drag source")
      setDragSource(index, dragHeight, dragStartY)
    }
  }

  render() {
    const { isActiveSource, children, isDraggable, onDragEnd } = this.props

    return (
      <DragSourceContainer
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

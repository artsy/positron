import React, { Component } from "react"
import PropTypes from "prop-types"

export class DragSource extends Component {
  static propTypes = {
    activeSource: PropTypes.bool,
    children: PropTypes.any.isRequired,
    isDraggable: PropTypes.bool,
    index: PropTypes.number.isRequired,
    onDragEnd: PropTypes.func.isRequired,
    setDragSource: PropTypes.func.isRequired,
  }

  setDragSource = e => {
    const { isDraggable, index, setDragSource } = this.props
    const { clientY, currentTarget } = e

    if (isDraggable) {
      const dragStartY =
        clientY - ($(currentTarget).position().top - window.scrollY)
      const dragHeight = $(currentTarget).height()

      setDragSource(index, dragHeight, dragStartY)
    }
  }

  render() {
    const { activeSource, children, isDraggable, onDragEnd } = this.props

    return (
      <div
        className="DragSource"
        data-source={activeSource}
        draggable={isDraggable}
        onDragEnd={onDragEnd}
        onDragStart={this.setDragSource}
      >
        {children}
      </div>
    )
  }
}

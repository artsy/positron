import PropTypes from "prop-types"
import React from "react"

export const CanvasControls = props => {
  const { activeLayout, setActiveLayout } = props

  return (
    <div className="display-admin--canvas__layouts">
      <button
        className="avant-garde-button"
        onClick={() => setActiveLayout("overlay")}
        data-active={activeLayout === "overlay"}
      >
        Overlay
      </button>
      <button
        className="avant-garde-button"
        onClick={() => setActiveLayout("standard")}
        data-active={activeLayout === "standard"}
      >
        Image/Video
      </button>
      <button
        className="avant-garde-button"
        onClick={() => setActiveLayout("slideshow")}
        data-active={activeLayout === "slideshow"}
      >
        Slideshow
      </button>
    </div>
  )
}

CanvasControls.propTypes = {
  activeLayout: PropTypes.string.isRequired,
  setActiveLayout: PropTypes.func.isRequired,
}

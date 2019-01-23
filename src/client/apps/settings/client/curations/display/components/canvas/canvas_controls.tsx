import {
  Button,
  ButtonGroup,
} from "client/apps/edit/components/admin/components/article/index"
import React from "react"

interface CanvasControlsProps {
  activeLayout: "overlay" | "slideshow" | "standard"
  setActiveLayout: (layout: "overlay" | "slideshow" | "standard") => void
}

export const CanvasControls: React.SFC<CanvasControlsProps> = props => {
  const { activeLayout, setActiveLayout } = props

  return (
    <ButtonGroup>
      <Button
        onClick={() => setActiveLayout("overlay")}
        variant="noOutline"
        color={activeLayout === "overlay" ? "black100" : "black10"}
      >
        Overlay
      </Button>
      <Button
        onClick={() => setActiveLayout("standard")}
        variant="noOutline"
        color={activeLayout === "standard" ? "black100" : "black10"}
      >
        Image/Video
      </Button>
      <Button
        onClick={() => setActiveLayout("slideshow")}
        variant="noOutline"
        color={activeLayout === "slideshow" ? "black100" : "black10"}
      >
        Slideshow
      </Button>
    </ButtonGroup>
  )
}

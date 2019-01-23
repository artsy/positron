import { Box, Checkbox, Col, Row, Serif } from "@artsy/palette"
import { FormLabel } from "client/components/form_label"
import React from "react"
import { CampaignProps } from "../campaign"
import { CanvasControls } from "./canvas_controls"
import { CanvasImages } from "./canvas_images"
import { CanvasText } from "./canvas_text"

interface CanvasState {
  activeLayout: "overlay" | "slideshow" | "standard"
}

export class Canvas extends React.Component<CampaignProps, CanvasState> {
  constructor(props) {
    super(props)
    this.state = {
      activeLayout: props.campaign.canvas.layout || "overlay",
    }
  }

  setActiveLayout = layout => {
    this.setState({ activeLayout: layout })
    this.props.onChange("canvas.layout", layout, this.props.index)
  }

  render() {
    const { campaign, index, onChange } = this.props
    return (
      <div>
        <Serif size="6" pt={4}>
          Canvas
        </Serif>
        <Box pb={4}>
          <CanvasControls
            activeLayout={this.state.activeLayout}
            setActiveLayout={this.setActiveLayout}
          />
        </Box>

        <Row>
          <Col lg pr={[0, 2]}>
            <CanvasText campaign={campaign} index={index} onChange={onChange} />
          </Col>

          <Col lg pl={[0, 2]}>
            <CanvasImages
              key={index}
              campaign={campaign}
              index={index}
              onChange={onChange}
            />

            {this.state.activeLayout === "overlay" && (
              <Checkbox
                selected={campaign.canvas.has_cover_overlay}
                onSelect={e => onChange("canvas.has_cover_overlay", e, index)}
              >
                <FormLabel>Show Canvas Image Overlay</FormLabel>
              </Checkbox>
            )}
          </Col>
        </Row>
      </div>
    )
  }
}

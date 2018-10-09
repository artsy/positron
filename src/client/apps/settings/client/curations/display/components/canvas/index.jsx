import PropTypes from "prop-types"
import React from "react"
import { Col, Row } from "react-styled-flexboxgrid"
import { CanvasControls } from "./canvas_controls.jsx"
import { CanvasImages } from "./canvas_images.jsx"
import { CanvasText } from "./canvas_text.jsx"

export class Canvas extends React.Component {
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
      <div className="display-admin--canvas">
        <div className="display-admin__section-title">Canvas</div>
        <CanvasControls
          activeLayout={this.state.activeLayout}
          setActiveLayout={this.setActiveLayout}
        />
        <Row className="display-admin__section--canvas">
          <Col lg>
            <CanvasText campaign={campaign} index={index} onChange={onChange} />
          </Col>
          <Col lg>
            <CanvasImages
              key={index}
              campaign={campaign}
              index={index}
              onChange={onChange}
            />
          </Col>
        </Row>
      </div>
    )
  }
}

Canvas.propTypes = {
  campaign: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}

import PropTypes from "prop-types"
import React from "react"
import { Col, Row } from "react-styled-flexboxgrid"
import { CharacterLimit } from "client/components/character_limit/index.jsx"
import { PanelImages } from "./panel_images.jsx"

export const Panel = props => {
  const { campaign, index, onChange } = props
  const { panel } = campaign
  return (
    <div className="display-admin__section--panel">
      <div className="display-admin__section-title">Panel</div>
      <Row key={index}>
        <Col lg>
          <div className="field-group">
            <CharacterLimit
              label="Headline"
              placeholder="Headline"
              defaultValue={panel.headline || ""}
              onChange={value => onChange("panel.headline", value, index)}
              limit={25}
            />
          </div>
          <div className="field-group">
            <label>CTA link</label>
            <input
              className="bordered-input"
              placeholder="Find Out More"
              defaultValue={panel.link ? panel.link.url : ""}
              onChange={e => onChange("panel.link.url", e.target.value, index)}
            />
          </div>
          <div className="field-group">
            <CharacterLimit
              type="textarea"
              label="Body"
              placeholder="Body"
              defaultValue={panel.body || ""}
              onChange={value => onChange("panel.body", value, index)}
              html
              limit={45}
            />
          </div>
          <div className="field-group">
            <label>Pixel Tracking Code (optional)</label>
            <input
              className="bordered-input"
              placeholder="Paste 3rd party script here"
              defaultValue={panel.pixel_tracking_code || ""}
              onChange={e =>
                onChange("panel.pixel_tracking_code", e.target.value, index)
              }
            />
          </div>
        </Col>
        <Col lg>
          <PanelImages campaign={campaign} index={index} onChange={onChange} />
        </Col>
      </Row>
    </div>
  )
}

Panel.propTypes = {
  campaign: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}

import PropTypes from "prop-types"
import React from "react"
import { CharacterLimit } from "client/components/character_limit/index.jsx"

export const CanvasText = props => {
  const { campaign, index, onChange } = props
  const { canvas } = campaign

  return (
    <div className="display-admin--canvas-text">
      <div className="field-group">
        {campaign.canvas.layout === "overlay" ? (
          <CharacterLimit
            type="textarea"
            label="Body"
            placeholder="Body"
            defaultValue={canvas.headline || ""}
            onChange={html => onChange("canvas.headline", html, index)}
            limit={70}
          />
        ) : (
          <CharacterLimit
            label="Headline"
            placeholder="Headline"
            defaultValue={canvas.headline || ""}
            onChange={value => onChange("canvas.headline", value, index)}
            limit={45}
          />
        )}
      </div>
      <div className="field-group">
        <CharacterLimit
          label="CTA Text"
          placeholder="Find Out More"
          defaultValue={canvas.link ? canvas.link.text : ""}
          onChange={value => onChange("canvas.link.text", value, index)}
          limit={25}
        />
      </div>
      <div className="field-group">
        <label>CTA Link</label>
        <input
          className="bordered-input"
          placeholder="http://example.com"
          defaultValue={canvas.link ? campaign.canvas.link.url : ""}
          onChange={e => onChange("canvas.link.url", e.target.value, index)}
        />
      </div>
      <div className="field-group">
        <CharacterLimit
          type="textarea"
          label="Disclaimer (optional)"
          placeholder="Enter legal disclaimer here"
          defaultValue={canvas.disclaimer || ""}
          onChange={value => onChange("canvas.disclaimer", value, index)}
          limit={150}
        />
      </div>
      <div className="field-group">
        <label>Pixel Tracking Code (optional)</label>
        <input
          className="bordered-input"
          placeholder="Paste 3rd party script here"
          defaultValue={canvas.pixel_tracking_code || ""}
          onChange={e =>
            onChange("canvas.pixel_tracking_code", e.target.value, index)
          }
        />
      </div>
    </div>
  )
}

CanvasText.propTypes = {
  campaign: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}

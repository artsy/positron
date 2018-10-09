import PropTypes from "prop-types"
import React from "react"
import { Col, Row } from "react-styled-flexboxgrid"
import ImageUpload from "client/apps/edit/components/admin/components/image_upload.coffee"

export const Metadata = props => {
  const { section, onChange } = props

  return (
    <Row between="xs">
      <Col lg={7}>
        <div className="field-group">
          <label>Description</label>
          <textarea
            className="bordered-input"
            defaultValue={section.description || ""}
            onChange={e => onChange("description", e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>Social Title</label>
          <input
            className="bordered-input"
            defaultValue={section.social_title || ""}
            onChange={e => onChange("social_title", e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>Social Description</label>
          <textarea
            className="bordered-input"
            defaultValue={section.social_description || ""}
            onChange={e => onChange("social_description", e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>Email Title</label>
          <input
            className="bordered-input"
            defaultValue={section.email_title || ""}
            onChange={e => onChange("email_title", e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>Email Author</label>
          <input
            className="bordered-input"
            defaultValue={section.email_author || ""}
            onChange={e => onChange("email_author", e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>Email Tags</label>
          <input
            className="bordered-input"
            defaultValue={section.email_tags || ""}
            onChange={e => onChange("email_tags", e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>Keywords</label>
          <input
            className="bordered-input"
            defaultValue={section.keywords || ""}
            onChange={e => onChange("keywords", e.target.value)}
          />
        </div>
      </Col>
      <Col lg={4}>
        <div className="field-group">
          <label>Thumbnail Image</label>
          <ImageUpload
            name="thumbnail_image"
            src={section.thumbnail_image || ""}
            onChange={(key, value) => onChange(key, value)}
          />
        </div>
        <div className="field-group">
          <label>Social Image</label>
          <ImageUpload
            name="social_image"
            src={section.social_image || ""}
            onChange={(key, value) => onChange(key, value)}
          />
        </div>
        <div className="field-group">
          <label>Email Image</label>
          <ImageUpload
            name="email_image"
            src={section.email_image || ""}
            onChange={(key, value) => onChange(key, value)}
          />
        </div>
      </Col>
    </Row>
  )
}

Metadata.propTypes = {
  section: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}

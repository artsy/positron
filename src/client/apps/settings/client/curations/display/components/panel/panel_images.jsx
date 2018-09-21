import PropTypes from "prop-types"
import React from "react"
import { Col, Row } from "react-styled-flexboxgrid"
import ImageUpload from "client/apps/edit/components/admin/components/image_upload.coffee"

export const PanelImages = props => {
  const { campaign, index, onChange } = props
  const assets = campaign.panel.assets || []
  const imgUrl = assets.length ? assets[0].url : ""
  const isVideo = assets.length && assets[0].url.includes("mp4")

  return (
    <Row>
      <Col lg>
        <label>Image / Video</label>
        <ImageUpload
          name="panel.assets"
          hasVideo
          src={imgUrl}
          size={30}
          onChange={(name, url) =>
            onImageInputChange(name, url, index, onChange)
          }
        />
      </Col>
      {isVideo ? (
        <Col lg className="img-cover">
          <label>Cover Image</label>
          <ImageUpload
            name="panel.cover_img_url"
            src={campaign.panel.cover_img_url || ""}
            onChange={(name, url) =>
              onImageInputChange(name, url, index, onChange)
            }
          />
        </Col>
      ) : (
        <Col lg className="img-logo">
          <label>Logo</label>
          <ImageUpload
            name="panel.logo"
            src={campaign.panel.logo || ""}
            onChange={(name, url) =>
              onImageInputChange(name, url, index, onChange)
            }
          />
        </Col>
      )}
    </Row>
  )
}

const onImageInputChange = (key, value, i, onChange) => {
  if (key.includes("assets")) {
    value = value.length ? [{ url: value }] : []
  }
  onChange(key, value, i)
}

PanelImages.propTypes = {
  campaign: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default PanelImages

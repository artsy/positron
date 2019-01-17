import { Col, Row } from "@artsy/palette"
import { FormLabel } from "client/components/form_label"
import React from "react"
import { CampaignProps } from "./index"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

export const PanelImages: React.SFC<CampaignProps> = props => {
  const { campaign, index, onChange } = props
  const assets = campaign.panel.assets || []
  const imgUrl = assets.length ? assets[0].url : ""
  const isVideo = assets.length && assets[0].url.includes("mp4")

  return (
    <Row>
      <Col lg>
        <FormLabel>Image / Video</FormLabel>
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
        <Col lg>
          <FormLabel>Cover Image</FormLabel>
          <ImageUpload
            name="panel.cover_img_url"
            src={campaign.panel.cover_img_url || ""}
            onChange={(name, url) =>
              onImageInputChange(name, url, index, onChange)
            }
          />
        </Col>
      ) : (
        <Col lg>
          <FormLabel>Logo</FormLabel>
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

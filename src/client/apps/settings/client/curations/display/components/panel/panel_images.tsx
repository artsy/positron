import { Box, Col, Row } from "@artsy/palette"
import { FormLabel } from "client/components/form_label"
import React from "react"
import { CampaignProps } from "../campaign"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

export const PanelImages: React.SFC<CampaignProps> = props => {
  const { campaign, index, onChange } = props
  const assets = campaign.panel.assets || []
  const imgUrl = assets.length ? assets[0].url : ""
  const isVideo = assets.length && assets[0].url.includes("mp4")

  return (
    <Row>
      <Col lg pr={[0, 1]} pb={4}>
        <FormLabel>Image / Video</FormLabel>
        <Box pt={1}>
          <ImageUpload
            name="panel.assets"
            hasVideo
            src={imgUrl}
            size={30}
            onChange={(name, url) =>
              onImageInputChange(name, url, index, onChange)
            }
          />
        </Box>
      </Col>
      {isVideo ? (
        <Col lg pr={[0, 1]} pb={4}>
          <FormLabel>Cover Image</FormLabel>
          <Box pt={1}>
            <ImageUpload
              name="panel.cover_img_url"
              src={campaign.panel.cover_img_url || ""}
              onChange={(name, url) =>
                onImageInputChange(name, url, index, onChange)
              }
            />
          </Box>
        </Col>
      ) : (
        <Col lg pl={[0, 1]} pb={4}>
          <FormLabel>Logo</FormLabel>
          <Box pt={1}>
            <ImageUpload
              name="panel.logo"
              src={campaign.panel.logo || ""}
              onChange={(name, url) =>
                onImageInputChange(name, url, index, onChange)
              }
            />
          </Box>
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

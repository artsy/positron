import { Box, Col, Flex, Row, space } from "@artsy/palette"
import { FormLabel as Label } from "client/components/form_label"
import { RemoveButtonContainer } from "client/components/remove_button"
import React from "react"
import styled from "styled-components"
import { CampaignProps } from "../campaign"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

export class CanvasImages extends React.Component<CampaignProps> {
  updateImageUrls = (imgIndex, url) => {
    const { assets } = this.props.campaign.canvas
    if (assets.length && Number.isInteger(imgIndex)) {
      if (url.length) {
        assets[imgIndex].url = url
      } else {
        assets.splice(imgIndex, 1)
      }
    } else {
      assets.push({ url })
    }
    return assets
  }

  onImageInputChange = (key, value, imgIndex) => {
    const { index, onChange } = this.props
    const assets = this.updateImageUrls(imgIndex, value)
    onChange(key, assets, index)
  }

  isSlideshow = () => {
    const { canvas } = this.props.campaign
    return canvas && canvas.layout === "slideshow"
  }

  renderAssets = () => {
    const { assets } = this.props.campaign.canvas

    const uploads = assets.map((_asset, imgIndex) => {
      if (imgIndex === 0) {
        return false
      } else {
        const indexIsEven = imgIndex % 2 === 0
        return (
          <Box
            width="50%"
            key={"slideshow-image-" + imgIndex}
            pl={indexIsEven ? [0, 1] : 0}
            pr={!indexIsEven ? [0, 1] : 0}
            pb={4}
          >
            <FormLabel>{this.renderLabel(imgIndex)}</FormLabel>
            {this.renderImageUpload(assets, imgIndex)}
          </Box>
        )
      }
    })
    return uploads
  }

  renderSlideshowImages = () => {
    const { assets } = this.props.campaign.canvas
    const imagesAreEven = assets.length && assets.length % 2 === 0

    const newImage = (
      <Col lg pl={imagesAreEven ? [0, 1] : 0} pt={imagesAreEven ? 2 : 0}>
        {this.renderImageUpload(assets)}
      </Col>
    )

    return (
      <Row>
        {this.renderAssets()}
        {assets.length && assets.length < 5 ? newImage : false}
      </Row>
    )
  }

  renderLogoUpload = () => {
    const { campaign, index, onChange } = this.props
    const isSlideshow = this.isSlideshow()
    return (
      <Col lg pr={isSlideshow ? [0, 1] : 0} pl={!isSlideshow ? [0, 1] : 0}>
        <FormLabel>Logo</FormLabel>
        <ImageUpload
          name="canvas.logo"
          src={campaign.canvas && campaign.canvas.logo}
          onChange={(name, url) => onChange(name, url, index)}
          disabled={false}
        />
      </Col>
    )
  }

  renderVideoCoverUpload = () => {
    const { campaign, index, onChange } = this.props
    return (
      <Row>
        <Col lg pl={[0, 1]}>
          <FormLabel>Video Cover Image</FormLabel>
          <ImageUpload
            name="canvas.cover_img_url"
            src={campaign.canvas && campaign.canvas.cover_img_url}
            onChange={(name, url) => onChange(name, url, index)}
            disabled={false}
          />
        </Col>
      </Row>
    )
  }

  renderImageUpload = (assets, imgIndex?: number) => {
    const hasVideo = this.props.campaign.canvas.layout === "standard"
    const hidePreview = !imgIndex && imgIndex !== 0 && !hasVideo

    return (
      <ImageUpload
        key={"canvas-assets-" + (imgIndex || 0)}
        name="canvas.assets"
        hasVideo={hasVideo}
        hidePreview={hidePreview}
        size={30}
        src={
          imgIndex || imgIndex === 0
            ? assets[imgIndex] && assets[imgIndex].url
            : ""
        }
        onChange={(name, url) => this.onImageInputChange(name, url, imgIndex)}
      />
    )
  }

  renderLabel = (imgIndex?: string) => {
    const { campaign } = this.props

    if (campaign.canvas.layout === "overlay") {
      return "Background Image"
    } else if (this.isSlideshow()) {
      const index = imgIndex ? imgIndex + 1 : 1
      return "Image " + index.toString()
    } else {
      return "Image / Video"
    }
  }

  render() {
    const { campaign } = this.props
    const layout = campaign.canvas.layout || "overlay"
    const videoIsAllowed = layout === "standard"
    const hasAsset =
      campaign.canvas.assets && campaign.canvas.assets.length !== 0
    const hasVideoAsset =
      hasAsset && campaign.canvas.assets[0].url.includes(".mp4")
    const isSlideshow = this.isSlideshow()

    return (
      <CanvasImagesContainer>
        <Flex flexDirection={isSlideshow ? "row" : "row-reverse"}>
          {this.renderLogoUpload()}
          <Col
            lg
            pl={isSlideshow ? [0, 1] : 0}
            pr={!isSlideshow ? [0, 1] : 0}
            pb={4}
          >
            <FormLabel>{this.renderLabel()}</FormLabel>
            {this.renderImageUpload(campaign.canvas.assets || [], 0)}
          </Col>
        </Flex>

        {videoIsAllowed && hasVideoAsset && this.renderVideoCoverUpload()}
        {this.isSlideshow() && this.renderSlideshowImages()}
      </CanvasImagesContainer>
    )
  }
}

const CanvasImagesContainer = styled.div`
  ${RemoveButtonContainer} {
    z-index: 5;
  }
`

const FormLabel = styled(Label)`
  padding-bottom: ${space(1)}px;
`

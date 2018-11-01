import styled from "styled-components"
import PropTypes from "prop-types"
import React from "react"
import { Col, Row } from "react-styled-flexboxgrid"
import ImageUpload from "../../../../../../edit/components/admin/components/image_upload.coffee"
import { RemoveButtonContainer } from "client/components/remove_button"

export class CanvasImages extends React.Component {
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
    const uploads = assets.map((asset, imgIndex) => {
      if (imgIndex === 0) {
        return false
      } else {
        return (
          <SecondaryImageContainer lg key={"slideshow-image-" + imgIndex}>
            <label>{this.renderLabel(imgIndex)}</label>
            {this.renderImageUpload(assets, imgIndex)}
          </SecondaryImageContainer>
        )
      }
    })
    return uploads
  }

  renderSlideshowImages = () => {
    const { assets } = this.props.campaign.canvas
    const newImage = <NewUpload>{this.renderImageUpload(assets)}</NewUpload>

    return (
      <SlideshowImages>
        {this.renderAssets()}
        {assets.length && assets.length < 5 ? newImage : false}
      </SlideshowImages>
    )
  }

  renderLogoUpload = () => {
    const { campaign, index, onChange } = this.props
    return (
      <Col lg className="img-logo">
        <label>Logo</label>
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
        <SecondaryImageContainer>
          <label>Video Cover Image</label>
          <ImageUpload
            name="canvas.cover_img_url"
            src={campaign.canvas && campaign.canvas.cover_img_url}
            onChange={(name, url) => onChange(name, url, index)}
            disabled={false}
          />
        </SecondaryImageContainer>
      </Row>
    )
  }

  renderImageUpload = (assets, imgIndex) => {
    const hasVideo = this.props.campaign.canvas.layout === "standard"
    const hidePreview = !imgIndex && imgIndex !== 0 && !hasVideo
    return (
      <ImageUpload
        key={"canvas-assets-" + (imgIndex || 0)}
        name="canvas.assets"
        hasVideo={hasVideo}
        hidePreview={hidePreview}
        size={30}
        src={assets[imgIndex] ? assets[imgIndex].url : ""}
        onChange={(name, url) => this.onImageInputChange(name, url, imgIndex)}
      />
    )
  }

  renderLabel = imgIndex => {
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
    const videoIsAllowed = campaign.canvas.layout === "standard"
    const hasAsset = campaign.canvas.assets && campaign.canvas.assets.length
    const hasVideoAsset =
      hasAsset && campaign.canvas.assets[0].url.includes(".mp4")

    return (
      <CanvasImagesContainer>
        <PrimaryImageContainer layout={campaign.canvas.layout || "overlay"}>
          {this.renderLogoUpload()}
          <Col lg>
            <label>{this.renderLabel()}</label>
            {this.renderImageUpload(campaign.canvas.assets || [], 0)}
          </Col>
        </PrimaryImageContainer>

        {videoIsAllowed && hasVideoAsset && this.renderVideoCoverUpload()}
        {this.isSlideshow() && this.renderSlideshowImages()}
      </CanvasImagesContainer>
    )
  }
}

CanvasImages.propTypes = {
  campaign: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}

const CanvasImagesContainer = styled.div`
  ${RemoveButtonContainer} {
    z-index: 5;
  }
`

const PrimaryImageContainer = styled(Row)`
  ${props =>
    (props.layout === "standard" || props.layout === "overlay") &&
    `
    flex-direction: row-reverse;
  `};
`

const SecondaryImageContainer = styled(Col)`
  margin-top: 20px;
  min-width: 50%;
`

const NewUpload = styled(Col)``

const SlideshowImages = styled(Row)`
  ${NewUpload} {
    margin-top: 2em;
    min-width: 50%;
  }
`

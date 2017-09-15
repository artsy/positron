import React, { Component } from 'react'
import Paragraph from '../../../../../../../components/rich_text2/components/paragraph.coffee'
import components from '@artsy/reaction-force/dist/components/publishing/index'
const IconRemove = components.Icon.Remove
const Image = components.Image

export default class ImageCollectionImage extends Component {
  constructor (props) {
    super(props)
  }

  onCaptionChange = (html) => {
    this.props.image.caption = html
    this.props.onChange()
  }

  renderRemoveButton(image) {
    if (this.props.removeItem && this.props.editing) {
      return (
        <div
          className='edit-section__remove'
          onClick={this.props.removeItem(image)}>
          <IconRemove />
        </div>
      )
    }
  }

  renderCaption(image) {
    if (!this.props.progress) {
      return(
        <Paragraph
          type='caption'
          placeholder='Image Caption'
          html={image.caption || ''}
          onChange={this.onCaptionChange}
          layout={this.props.article.get('layout')} />
      )
    }
  }

  getContainerWidth(dimensions) {
    if (dimensions && dimensions[this.props.index] &&
      this.props.section.get('layout') !== 'fillwidth') {
      return dimensions[this.props.index].width
    } else {
      return 'auto'
    }
  }

  render() {
    const { image, dimensions, imagesLoaded } = this.props
    return (
      <div
        className='image-collection__img-container'
        style={{
          width: this.getContainerWidth(dimensions),
          opacity: imagesLoaded ? 1 : 0
        }} >
        <Image image={image}>
          {this.renderCaption(image)}
        </Image>
        {this.renderRemoveButton(image)}
      </div>
    )
  }
}

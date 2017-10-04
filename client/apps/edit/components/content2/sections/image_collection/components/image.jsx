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
          stripLinebreaks={true}
          layout={this.props.article.get('layout')} />
      )
    }
  }

  render() {
    const { image, imagesLoaded, section, width } = this.props
    return (
      <div
        className='image-collection__img-container'
        style={{
          width: width,
          opacity: imagesLoaded ? 1 : 0
        }} >
        <Image image={image} sectionLayout={section.get('layout')}>
          {this.renderCaption(image)}
        </Image>
        {this.renderRemoveButton(image)}
      </div>
    )
  }
}

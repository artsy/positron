import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Paragraph from '../../../../../../../components/rich_text2/components/paragraph.coffee'
import components from '@artsy/reaction-force/dist/Components/Publishing/index'
const IconRemove = components.Icon.Remove
const Image = components.Image

export default class ImageCollectionImage extends Component {
  onCaptionChange = (html) => {
    this.props.image.caption = html
    this.props.onChange()
  }

  renderRemoveButton (image) {
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

  renderCaption (image) {
    if (!this.props.progress) {
      return (
        <Paragraph
          type='caption'
          placeholder='Image Caption'
          html={image.caption || ''}
          onChange={this.onCaptionChange}
          stripLinebreaks
          layout={this.props.article.get('layout')} />
      )
    }
  }

  render () {
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

ImageCollectionImage.propTypes = {
  article: PropTypes.object.isRequired,
  editing: PropTypes.bool,
  image: PropTypes.object.isRequired,
  imagesLoaded: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  removeItem: PropTypes.func,
  progress: PropTypes.number,
  section: PropTypes.object.isRequired,
  width: PropTypes.any
}

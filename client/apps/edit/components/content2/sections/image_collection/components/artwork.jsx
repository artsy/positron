import React, { Component } from 'react'
import components from '@artsy/reaction-force/dist/components/publishing/index'
const IconRemove = components.Icon.Remove
const Artwork = components.Artwork

export default class ImageCollectionArtwork extends Component {
  constructor (props) {
    super(props)
  }

  renderRemoveButton(artwork) {
    if (this.props.removeItem && this.props.editing) {
      return (
        <div
          className='edit-section__remove'
          onClick={this.props.removeItem(artwork)}>
          <IconRemove />
        </div>
      )
    }
  }

  getContainerWidth(dimensions) {
    if (dimensions && dimensions[this.props.index]) {
      return dimensions[this.props.index].width
    } else {
      return 'auto'
    }
  }

  render() {
    const { artwork, article, dimensions } = this.props
    return (
      <div
        className='image-collection__img-container'
        style={{
          width: this.getContainerWidth(dimensions),
          opacity: this.props.imagesLoaded ? 1 : 0
        }} >
        <Artwork
          layout={article.get('layout')}
          artwork={artwork}
          linked={false} />
        {this.renderRemoveButton(artwork)}
      </div>
    )
  }
}

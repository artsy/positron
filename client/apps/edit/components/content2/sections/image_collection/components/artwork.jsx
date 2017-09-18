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

  render() {
    const { article, artwork, imagesLoaded, section, width } = this.props
    return (
      <div
        className='image-collection__img-container'
        style={{
          width: width,
          opacity: imagesLoaded ? 1 : 0
        }} >
        <Artwork
          layout={article.get('layout')}
          sectionLayout={section.get('layout')}
          artwork={artwork}
          linked={false} />
        {this.renderRemoveButton(artwork)}
      </div>
    )
  }
}

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Artwork, Icon } from '@artsy/reaction-force/dist/Components/Publishing'
const IconRemove = Icon.IconRemove

export default class ImageCollectionArtwork extends Component {
  renderRemoveButton (artwork) {
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

  render () {
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
ImageCollectionArtwork.propTypes = {
  article: PropTypes.object.isRequired,
  editing: PropTypes.bool,
  artwork: PropTypes.object.isRequired,
  imagesLoaded: PropTypes.bool,
  removeItem: PropTypes.func,
  section: PropTypes.object.isRequired,
  width: PropTypes.any
}

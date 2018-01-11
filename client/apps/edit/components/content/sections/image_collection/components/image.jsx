import { clone } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Artwork, Image } from '@artsy/reaction-force/dist/Components/Publishing'
import { RemoveButton } from 'client/components/remove_button/index.jsx'
import Paragraph from 'client/components/rich_text/components/paragraph.coffee'

export class ImageCollectionImage extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    image: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    imagesLoaded: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    removeItem: PropTypes.func,
    progress: PropTypes.number,
    section: PropTypes.object.isRequired,
    width: PropTypes.any
  }

  onCaptionChange = (html) => {
    const {
      image,
      index,
      section,
      onChange
    } = this.props

    const newImages = clone(section.get('images'))
    let newImage = Object.assign({}, image)

    newImage.caption = html
    newImages[index] = newImage
    section.set('images', newImages)
    onChange()
  }

  editCaption = () => {
    const { article, image, progress } = this.props

    if (!progress) {
      return (
        <Paragraph
          type='caption'
          placeholder='Image Caption'
          html={image.caption || ''}
          onChange={this.onCaptionChange}
          stripLinebreaks
          layout={article.get('layout')}
        />
      )
    }
  }

  render () {
    const {
      article,
      editing,
      image,
      imagesLoaded,
      removeItem,
      section,
      width
    } = this.props

    const isArtwork = image.type === 'artwork'

    return (
      <div
        className='image-collection__img-container'
        style={{
          width: width,
          opacity: imagesLoaded ? 1 : 0
        }}
      >

        {isArtwork
          ? <Artwork
              artwork={image}
              layout={article.get('layout')}
              linked={false}
              sectionLayout={section.get('layout')}
            />

            : <Image
                editCaption={this.editCaption}
                image={image}
                linked={false}
                sectionLayout={section.get('layout')}
              />
        }

        {editing && removeItem &&
          <RemoveButton
            className='edit-section__remove'
            onClick={() => removeItem(image)}
          />
        }
      </div>
    )
  }
}

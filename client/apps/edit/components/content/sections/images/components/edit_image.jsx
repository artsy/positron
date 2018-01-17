import { clone } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Artwork, Image } from '@artsy/reaction-force/dist/Components/Publishing'
import { RemoveButton } from 'client/components/remove_button'
import Paragraph from 'client/components/rich_text/components/paragraph.coffee'

export class EditImage extends Component {
  static propTypes = {
    articleLayout: PropTypes.string.isRequired,
    editing: PropTypes.bool,
    image: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    progress: PropTypes.number,
    removeImage: PropTypes.func,
    section: PropTypes.object.isRequired,
    width: PropTypes.any
  }

  onCaptionChange = (html) => {
    const {
      image,
      index,
      section
    } = this.props

    const newImages = clone(section.get('images'))
    let newImage = Object.assign({}, image)

    newImage.caption = html
    newImages[index] = newImage
    section.set('images', newImages)
  }

  editCaption = () => {
    const { articleLayout, image, progress } = this.props

    if (!progress) {
      return (
        <Paragraph
          type='caption'
          placeholder='Image Caption'
          html={image.caption || ''}
          onChange={this.onCaptionChange}
          stripLinebreaks
          layout={articleLayout}
        />
      )
    }
  }

  render () {
    const {
      articleLayout,
      editing,
      image,
      removeImage,
      section,
      width
    } = this.props

    const isArtwork = image.type === 'artwork'

    return (
      <div
        className='EditImage'
        style={{ width }}
      >

        {isArtwork
          ? <Artwork
              artwork={image}
              layout={articleLayout}
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

        {editing && removeImage &&
          <RemoveButton onClick={() => removeImage(image)} />
        }
      </div>
    )
  }
}

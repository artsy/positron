import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { clone, without } from 'lodash'
import { connect } from 'react-redux'
import { Artwork, Image } from '@artsy/reaction-force/dist/Components/Publishing'
import { RemoveButton } from 'client/components/remove_button'
import Paragraph from 'client/components/rich_text/components/paragraph.coffee'
import { onChangeSection } from 'client/actions/editActions'

export class EditImage extends Component {
  static propTypes = {
    article: PropTypes.object,
    editing: PropTypes.bool,
    image: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func,
    progress: PropTypes.number,
    section: PropTypes.object.isRequired,
    width: PropTypes.any
  }

  removeImage = () => {
    const { section, image, onChange } = this.props
    const newImages = without(section.images, image)

    onChange('images', newImages)
  }

  onCaptionChange = (html) => {
    const {
      image,
      index,
      onChange,
      section
    } = this.props

    const newImages = clone(section.images)
    let newImage = Object.assign({}, image)

    newImage.caption = html
    newImages[index] = newImage
    onChange('images', newImages)
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
          layout={article.layout}
        />
      )
    }
  }

  render () {
    const {
      article,
      editing,
      image,
      section,
      width
    } = this.props

    const isArtwork = image.type === 'artwork'
    const isClassic = article.layout === 'classic'
    const isSingle = section.images.length === 1

    const imgWidth = isSingle && !isClassic ? '100%' : `${width}px`

    return (
      <EditImageContainer
        className='EditImage'
        width={imgWidth}
      >

        {isArtwork
          ? <Artwork
              artwork={image}
              layout={article.layout}
              linked={false}
              sectionLayout={section.layout}
            />

            : <Image
                editCaption={this.editCaption}
                image={image}
                layout={article.layout}
                linked={false}
                sectionLayout={section.layout}
              />
        }

        {editing &&
          <RemoveButton onClick={this.removeImage} />
        }
      </EditImageContainer>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article
})

const mapDispatchToProps = {
  onChange: onChangeSection
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditImage)

const EditImageContainer = styled.div`
  width: ${(props) => props.width};
`

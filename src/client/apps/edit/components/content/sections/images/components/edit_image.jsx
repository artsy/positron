import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { clone, without } from 'lodash'
import { connect } from 'react-redux'
import { Artwork, Image } from '@artsy/reaction/dist/Components/Publishing'
import Paragraph from 'client/components/rich_text/components/paragraph.coffee'
import { onChangeHero, onChangeSection } from 'client/actions/edit/sectionActions'
import { RemoveButton } from 'client/components/remove_button'

export class EditImage extends Component {
  static propTypes = {
    article: PropTypes.object,
    editing: PropTypes.bool,
    image: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    isHero: PropTypes.bool,
    onChangeHeroAction: PropTypes.func,
    onChangeSectionAction: PropTypes.func,
    progress: PropTypes.number,
    section: PropTypes.object.isRequired,
    width: PropTypes.any
  }

  onChange = (images) => {
    const {
      isHero,
      onChangeHeroAction,
      onChangeSectionAction
    } = this.props

    if (isHero) {
      onChangeHeroAction('images', images)
    } else {
      onChangeSectionAction('images', images)
    }
  }

  removeImage = () => {
    const { section, image } = this.props
    const newImages = without(section.images, image)

    this.onChange(newImages)
  }

  onCaptionChange = (html) => {
    const {
      image,
      index,
      section
    } = this.props

    const newImages = clone(section.images)
    let newImage = Object.assign({}, image)

    newImage.caption = html
    newImages[index] = newImage

    this.onChange(newImages)
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
              editing
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
  onChangeHeroAction: onChangeHero,
  onChangeSectionAction: onChangeSection
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditImage)

const EditImageContainer = styled.div`
  width: ${(props) => props.width};
`

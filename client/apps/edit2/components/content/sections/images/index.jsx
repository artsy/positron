import FillWidth from '@artsy/reaction-force/dist/Utils/fillwidth'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { without } from 'lodash'
import DragContainer from 'client/components/drag_drop/index.coffee'
import ImagesControls from './components/controls'
import { EditImage } from './components/edit_image'
import { ImageSet } from './components/image_set'
import { ProgressBar } from 'client/components/file_input/progress_bar'

export class SectionImages extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    isHero: PropTypes.bool,
    section: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      dimensions: this.setFillWidthDimensions(),
      progress: null
    }
  }

  componentDidMount = () => {
    const { section } = this.props

    section.on('change:images', this.resetDimensions)
  }

  resetDimensions = () => {
    const dimensions = this.setFillWidthDimensions()

    this.setState({ dimensions })
  }

  setFillWidthDimensions = () => {
    const { section } = this.props
    const sizes = this.getContainerSizes()

    return FillWidth(
      section.get('images') || [],
      sizes.containerSize,
      30,
      sizes.targetHeight
    )
  }

  getFillWidthDimensions = () => {
    const { section } = this.props
    const { dimensions } = this.state

    return section.get('layout') !== 'column_width'
      ? dimensions
      : false
  }

  getContainerSizes = () => {
    const { article, section } = this.props
    const articleLayout = article.layout
    const sectionLayout = section.get('layout')

    let containerSize = sectionLayout === 'column_width' ? 680 : 780
    let targetHeight = window.innerHeight * 0.7

    if (articleLayout === 'classic') {
      containerSize = sectionLayout === 'column_width' ? 580 : 900
    }
    if (this.isImageSetWrapping()) {
      targetHeight = 400
      containerSize = articleLayout === 'classic' ? 580 : 680
    }
    return { containerSize, targetHeight }
  }

  removeImage = (image) => {
    const { section } = this.props
    const images = without(section.get('images'), image)

    section.set('images', images)
  }

  onDragEnd = (images) => {
    const { section } = this.props

    section.set({ images })
    this.resetDimensions()
  }

  isImageSetWrapping = () => {
    const { section } = this.props
    const { type, images } = section.attributes

    return type === 'image_set' && images && images.length > 3
  }

  getImageWidth = (index) => {
    const dimensions = this.getFillWidthDimensions()

    if (dimensions[index]) {
      const { width } = dimensions[index]
      return this.isImageSetWrapping() ? width * 2 : width
    } else {
      return 'auto'
    }
  }

  renderImages = (images) => {
    return images.map((image, index) => {
      const { article, editing, section } = this.props
      const articleLayout = article.layout
      const width = this.getImageWidth(index)

      const props = {
        articleLayout,
        editing,
        image,
        index,
        removeImage: () => this.removeImage(image),
        section,
        width
      }

      return (
        <EditImage key={index} {...props} />
      )
    })
  }

  renderDraggableImages = (images) => {
    const { editing } = this.props

    return (
      <DragContainer
        items={images}
        onDragEnd={this.onDragEnd}
        isDraggable={editing}
        dimensions={this.getFillWidthDimensions()}
        isWrapping={this.isImageSetWrapping()}
      >
        {this.renderImages(images)}
      </DragContainer>
    )
  }

  render () {
    const { progress } = this.state
    const {
      article,
      editing,
      isHero,
      section
    } = this.props
    const images = section.get('images') || []

    return (
      <section className='SectionImages'>
        {editing &&
          <ImagesControls
            section={section}
            articleLayout={article.layout}
            editing={editing}
            images={images}
            isHero={isHero}
            setProgress={(progress) => this.setState({ progress })}
          />
        }

        {progress && <ProgressBar progress={progress} cover />}

        <div
          className='SectionImages__list'
          data-overflow={this.isImageSetWrapping()}
        >
          {images.length > 0
            ? section.get('type') === 'image_set' && !editing
              ? <ImageSet
                  articleLayout={article.layout}
                  section={section}
                />

                : (images.length > 1 && editing)
                  ? this.renderDraggableImages(images)
                  : this.renderImages(images)

            : <div className='edit-section__placeholder'>
                Add images and artworks above
              </div>
          }
        </div>
      </section>
    )
  }
}

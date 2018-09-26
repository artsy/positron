// Images section supports a mix of uploaded images and artworks

import FillWidth from "@artsy/reaction/dist/Utils/fillwidth"
import PropTypes from "prop-types"
import React, { Component } from "react"
import { connect } from "react-redux"
import DragContainer from "client/components/drag_drop/index.coffee"
import ImagesControls from "./components/controls"
import EditImage from "./components/edit_image"
import { ImageSet } from "./components/image_set"
import { ProgressBar } from "client/components/file_input/progress_bar"
import {
  onChangeHero,
  onChangeSection,
} from "client/actions/edit/sectionActions"

export class SectionImages extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    isHero: PropTypes.bool,
    onChangeHeroAction: PropTypes.func,
    onChangeSectionAction: PropTypes.func,
    section: PropTypes.object.isRequired,
  }

  state = {
    progress: null,
  }

  setFillWidthDimensions = () => {
    const { section } = this.props
    const sizes = this.getContainerSizes()

    return FillWidth(
      section.images || [],
      sizes.containerSize,
      30,
      sizes.targetHeight
    )
  }

  getFillWidthDimensions = () => {
    const { section } = this.props

    return section.layout !== "column_width"
      ? this.setFillWidthDimensions()
      : false
  }

  getContainerSizes = () => {
    const { article, section } = this.props
    const articleLayout = article.layout
    const sectionLayout = section.layout

    let containerSize = sectionLayout === "column_width" ? 680 : 780
    let targetHeight = window.innerHeight * 0.7

    if (articleLayout === "classic") {
      containerSize = sectionLayout === "column_width" ? 580 : 900
    }
    if (this.isImageSetWrapping()) {
      targetHeight = 400
      containerSize = articleLayout === "classic" ? 580 : 680
    }
    return { containerSize, targetHeight }
  }

  onDragEnd = images => {
    const { isHero, onChangeHeroAction, onChangeSectionAction } = this.props

    if (isHero) {
      onChangeHeroAction("images", images)
    } else {
      onChangeSectionAction("images", images)
    }
  }

  isImageSetWrapping = () => {
    const { section } = this.props
    const { type, images } = section

    return type === "image_set" && images && images.length > 3
  }

  getImageWidth = index => {
    const dimensions = this.getFillWidthDimensions()

    if (dimensions[index]) {
      const { width } = dimensions[index]
      return this.isImageSetWrapping() ? width * 2 : width
    } else {
      return "auto"
    }
  }

  renderImages = images => {
    return images.map((image, index) => {
      const { editing, isHero, section } = this.props
      const width = this.getImageWidth(index)

      const props = {
        editing,
        image,
        index,
        isHero,
        section,
        width,
      }

      return <EditImage key={index} {...props} />
    })
  }

  renderDraggableImages = images => {
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

  render() {
    const { progress } = this.state
    const { article, editing, isHero, section } = this.props
    const images = section.images || []

    return (
      <section className="SectionImages">
        {editing && (
          <ImagesControls
            section={section}
            editing={editing}
            images={images}
            isHero={isHero}
            setProgress={progress => this.setState({ progress })}
          />
        )}

        {progress && <ProgressBar progress={progress} cover />}

        <div
          className="SectionImages__list"
          data-overflow={this.isImageSetWrapping()}
        >
          {images.length > 0 ? (
            section.type === "image_set" && !editing ? (
              <ImageSet articleLayout={article.layout} section={section} />
            ) : images.length > 1 && editing ? (
              this.renderDraggableImages(images)
            ) : (
              this.renderImages(images)
            )
          ) : (
            <div className="edit-section__placeholder">
              Add images and artworks above
            </div>
          )}
        </div>
      </section>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeHeroAction: onChangeHero,
  onChangeSectionAction: onChangeSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionImages)

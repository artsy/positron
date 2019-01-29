// Images section supports a mix of uploaded images and artworks
import { color, Flex } from "@artsy/palette"
import {
  ArticleData,
  SectionData,
  SectionLayout,
} from "@artsy/reaction/dist/Components/Publishing/Typings"
import FillWidth from "@artsy/reaction/dist/Utils/fillwidth"
import {
  onChangeHero,
  onChangeSection,
} from "client/actions/edit/sectionActions"
import { DragContainer, DragDropList } from "client/components/drag_drop2"
import { DragTargetContainer } from "client/components/drag_drop2/drag_target"
import { EditSectionPlaceholder } from "client/components/edit_section_placeholder"
import { ProgressBar } from "client/components/file_input/progress_bar"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import ImagesControls from "./components/controls"
import EditImage from "./components/edit_image"
import { ImageSet } from "./components/image_set"

interface SectionImagesProps {
  article: ArticleData
  editing: boolean
  isHero: boolean
  onChangeHeroAction: (key: string, val: any) => void
  onChangeSectionAction: (key: string, val: any) => void
  section: SectionData
}

interface SectionImagesState {
  progress: number | null
}

export class SectionImages extends Component<
  SectionImagesProps,
  SectionImagesState
> {
  state = {
    progress: null,
  }

  setFillWidthDimensions = () => {
    const { editing, section } = this.props
    const sizes = this.getContainerSizes()
    let containerSize = sizes.containerSize

    if (editing) {
      containerSize = sizes.containerSize - 38 // container padding - border
    }
    return FillWidth(
      section.images || [],
      containerSize,
      30,
      sizes.targetHeight
    )
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
    const dimensions = this.setFillWidthDimensions()

    if (dimensions[index]) {
      const { width } = dimensions[index]
      return this.isImageSetWrapping() ? width * 2 : width
    } else {
      return "auto"
    }
  }

  renderImages = (images, editing = false) => {
    return images.map((image, index) => {
      const { isHero, section } = this.props
      const width = this.getImageWidth(index)

      const props = {
        editing,
        image,
        index,
        isHero,
        section,
        width,
      }

      return <EditImage key={index} {...props} isDraggable={editing} />
    })
  }

  renderDraggableImages = images => {
    return (
      <DragDropList
        items={images}
        onDragEnd={this.onDragEnd}
        isDraggable
        dimensions={this.setFillWidthDimensions()}
        isWrapping={this.isImageSetWrapping()}
      >
        {this.renderImages(images, true)}
      </DragDropList>
    )
  }

  render() {
    const { progress } = this.state
    const { article, editing, isHero, section } = this.props
    const images = section.images || []

    return (
      <SectionImagesContainer sectionLayout={section.layout || "column_width"}>
        {editing && (
          <ImagesControls
            section={section}
            editing={editing}
            images={images}
            isHero={isHero}
            setProgress={(val: number) => this.setState({ progress: val })}
          />
        )}

        {progress !== null && <ProgressBar progress={progress} cover />}

        <SectionImagesList
          justifyContent="center"
          className="SectionImages__list"
          data-overflow={this.isImageSetWrapping()}
          isEditing={editing}
        >
          {images.length > 0 ? (
            section.type === "image_set" && !editing ? (
              <ImageSet
                articleLayout={article.layout || "standard"}
                section={section as any}
              />
            ) : images.length > 1 && editing ? (
              this.renderDraggableImages(images)
            ) : (
              this.renderImages(images)
            )
          ) : (
            <EditSectionPlaceholder>
              Add images and artworks above
            </EditSectionPlaceholder>
          )}
        </SectionImagesList>
      </SectionImagesContainer>
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

const SectionImagesContainer = styled.section.attrs<{
  sectionLayout: SectionLayout
}>({})`
  .RemoveButton {
    position: absolute;
    top: -12px;
    right: -12px;
    height: 30px;
    width: 30px;
  }

  [data-target="true"] .RemoveButton {
    display: none;
  }

  ${props =>
    props.sectionLayout === "fillwidth" &&
    `
    .RemoveButton {
      top: 20px;
      right: 20px;
      circle {
        fill: ${color("black30")}
      }
      &:hover circle {
        fill: ${color("red100")};
      }
    }
  `};
`

const SectionImagesList = styled(Flex).attrs<{ isEditing?: boolean }>({})`
  position: relative;
  z-index: ${props => (props.isEditing ? "2" : "-1")};

  ${DragContainer} {
    flex-direction: row;
    justify-content: space-between;
  }

  ${DragTargetContainer} {
    max-width: 100%;
    margin-right: 30px;

    &:last-child {
      margin-right: 0;
    }
  }
`

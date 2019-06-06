import { Flex } from "@artsy/palette"
import { IconImageFullscreen } from "@artsy/reaction/dist/Components/Publishing/Icon/IconImageFullscreen"
import { IconImageSet } from "@artsy/reaction/dist/Components/Publishing/Icon/IconImageSet"
import {
  ArticleData,
  SectionData,
} from "@artsy/reaction/dist/Components/Publishing/Typings"
import { onChangeSection } from "client/actions/edit/sectionActions"
import { Channel } from "client/typings"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"

interface LayoutControlsProps {
  article: ArticleData
  channel: Channel
  disabledAlert: () => void
  section: SectionData
  onChangeSectionAction: (key: any, val?: any) => void
}

export class LayoutControls extends Component<LayoutControlsProps> {
  changeLayout = layout => {
    const { section, disabledAlert, onChangeSectionAction } = this.props
    const { images, type } = section

    const isFillwidth = layout === "fillwidth"
    const isImage = this.sectionIsImage()

    if (isFillwidth && isImage && images && images.length > 1) {
      return disabledAlert()
    }
    if (type === "image_set") {
      onChangeSectionAction("type", "image_collection")
    }
    onChangeSectionAction("layout", layout)
  }

  toggleImageSet = () => {
    const { section, onChangeSectionAction } = this.props

    if (section.type === "image_collection") {
      onChangeSectionAction("type", "image_set")
      onChangeSectionAction("layout", "mini")
    }
  }

  hasImageSet = () => {
    const { type } = this.props.channel

    const isImage = this.sectionIsImage()
    const isEditoral = type === "editorial"
    const isTeam = type === "team"

    return (isImage && isEditoral) || isTeam
  }

  sectionIsImage = () => {
    const { type } = this.props.section

    return type.includes("image")
  }

  sectionHasFullscreen = () => {
    const { article, section } = this.props

    const isFeature = article.layout === "feature"
    const isImage = this.sectionIsImage()
    const isMedia = ["embed", "video"].includes(section.type)
    const hasFullscreen = isMedia || isImage

    return isFeature && hasFullscreen
  }

  render() {
    const { section } = this.props

    return (
      <Flex
        alignItems="center"
        justifyContent="center"
        height={45}
        textAlign="center"
      >
        <LayoutButton
          type="overflow_fillwidth"
          onClick={() => this.changeLayout("overflow_fillwidth")}
          isActive={section.layout === "overflow_fillwidth"}
        />
        <LayoutButton
          type="column_width"
          onClick={() => this.changeLayout("column_width")}
          isActive={section.layout === "column_width"}
        />

        {this.sectionHasFullscreen() && (
          <LayoutButton
            type="fillwidth"
            onClick={() => this.changeLayout("fillwidth")}
            isActive={section.layout === "fillwidth"}
          >
            <IconImageFullscreen fill={"white"} />
          </LayoutButton>
        )}

        {this.hasImageSet() && (
          <LayoutButton
            type="image_set"
            onClick={this.toggleImageSet}
            isActive={section.type === "image_set"}
          >
            <IconImageSet color="white" />
          </LayoutButton>
        )}
      </Flex>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
  channel: state.app.channel,
  section: state.edit.section,
})

const mapDispatchToProps = {
  onChangeSectionAction: onChangeSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LayoutControls)

export const LayoutButton = styled.a<{ isActive?: boolean; type: string }>`
  height: 40px;
  width: 60px;
  background-repeat: no-repeat;
  background-position: 50%;
  transition: opacity 0.3s;
  opacity: 0.5;
  text-align: center;

  &:hover {
    opacity: 1;
  }

  ${props =>
    props.isActive &&
    `
    opacity: 1;
  `};

  ${props =>
    props.type === "overflow_fillwidth" &&
    `
    background-image: url(/icons/edit_artworks_overflow_fillwidth.svg);
    background-size: 38px;
  `};

  ${props =>
    props.type === "column_width" &&
    `
    background-image: url(/icons/edit_artworks_column_width.svg);
    background-size: 22px;
  `};

  ${props =>
    props.type === "image_set" &&
    `
    svg {
      width: 24px;
      height: 38px;
    }
  `};

  ${props =>
    props.type === "fillwidth" &&
    `
    svg {
      margin-top: 9px;
    }
  `};
`

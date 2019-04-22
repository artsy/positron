import { color } from "@artsy/palette"
import { avantgarde } from "@artsy/reaction/dist/Assets/Fonts"
import { IconEditEmbed } from "@artsy/reaction/dist/Components/Publishing/Icon/IconEditEmbed"
import { IconEditImages } from "@artsy/reaction/dist/Components/Publishing/Icon/IconEditImages"
import { IconEditSection } from "@artsy/reaction/dist/Components/Publishing/Icon/IconEditSection"
import { IconEditText } from "@artsy/reaction/dist/Components/Publishing/Icon/IconEditText"
import { IconEditVideo } from "@artsy/reaction/dist/Components/Publishing/Icon/IconEditVideo"
import { IconHeroImage } from "@artsy/reaction/dist/Components/Publishing/Icon/IconHeroImage"
import { IconHeroVideo } from "@artsy/reaction/dist/Components/Publishing/Icon/IconHeroVideo"
import { getSectionWidth } from "@artsy/reaction/dist/Components/Publishing/Sections/SectionContainer"
import {
  ArticleData,
  SectionData,
} from "@artsy/reaction/dist/Components/Publishing/Typings"
import { newHeroSection, newSection } from "client/actions/edit/sectionActions"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"

interface Props {
  article: ArticleData
  firstSection?: boolean
  index: number
  isEditing?: boolean
  isHero?: boolean
  isPartnerChannel: boolean
  newHeroSectionAction: (type: string) => void
  newSectionAction: (type: string, index: number) => void
  onSetEditing: (editing: boolean | number) => void
  sections: SectionData[]
}

export class SectionTool extends Component<Props> {
  state = {
    isOpen: false,
  }

  toggleOpen = () => {
    this.setState({ isOpen: !this.state.isOpen })
  }

  newSection = type => {
    const { index, newSectionAction } = this.props

    newSectionAction(type, index + 1)
    this.setState({ isOpen: false })
  }

  setHero = type => {
    const { newHeroSectionAction, onSetEditing } = this.props

    newHeroSectionAction(type)
    this.setState({ isOpen: false })
    onSetEditing(true)
  }

  renderHeroMenu() {
    if (this.state.isOpen) {
      return (
        <SectionToolMenu>
          <SectionToolMenuItem onClick={() => this.setHero("image_collection")}>
            <IconHeroImage />
            Large Format Image
          </SectionToolMenuItem>

          <SectionToolMenuItem onClick={() => this.setHero("video")}>
            <IconHeroVideo />
            Large Format Video
          </SectionToolMenuItem>
        </SectionToolMenu>
      )
    }
  }

  renderSectionMenu() {
    const {
      article: { layout },
      firstSection,
      isPartnerChannel,
    } = this.props
    const { isOpen } = this.state
    const isNews = layout === "news"

    if (isOpen) {
      return (
        <SectionToolMenu>
          <SectionToolMenuItem onClick={() => this.newSection("text")}>
            <IconEditText />
            Text
          </SectionToolMenuItem>

          <SectionToolMenuItem
            onClick={() => this.newSection("image_collection")}
          >
            <IconEditImages />
            {isNews ? "Image" : "Images"}
          </SectionToolMenuItem>

          {!isNews && (
            <SectionToolMenuItem onClick={() => this.newSection("video")}>
              <IconEditVideo />
              Video
            </SectionToolMenuItem>
          )}

          {!isPartnerChannel &&
            !isNews && (
              <SectionToolMenuItem onClick={() => this.newSection("embed")}>
                <IconEditEmbed />
                Embed
              </SectionToolMenuItem>
            )}

          {layout !== "classic" &&
            !firstSection && (
              <SectionToolMenuItem
                onClick={() => this.newSection("social_embed")}
              >
                <IconEditEmbed />
                Social Embed
              </SectionToolMenuItem>
            )}
        </SectionToolMenu>
      )
    }
  }

  render() {
    const {
      article,
      firstSection,
      index,
      isEditing,
      isHero,
      sections,
    } = this.props
    const { isOpen } = this.state

    const isFirstSection = sections && firstSection && sections.length === 0
    const isLastSection = sections && index === sections.length - 1
    const sectionWidth = getSectionWidth(undefined, article.layout)
    const isVisible = isFirstSection || isLastSection || isHero

    return (
      <SectionToolContainer
        isEditing={isEditing}
        isOpen={isOpen}
        isHero={isHero}
        isVisible={isVisible}
        width={sectionWidth}
      >
        <SectionToolIcon
          width={sectionWidth}
          isHero={isHero}
          isVisible={isVisible}
          isOpen={isOpen}
          onClick={this.toggleOpen}
        >
          <IconEditSection
            fill={isOpen || !isHero ? "#000" : color("black10")}
            isClosing={isOpen}
          />
        </SectionToolIcon>

        {isHero ? this.renderHeroMenu() : this.renderSectionMenu()}
      </SectionToolContainer>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
  isPartnerChannel: state.app.isPartnerChannel,
})

const mapDispatchToProps = {
  newHeroSectionAction: newHeroSection,
  newSectionAction: newSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionTool)

const SectionToolContainer = styled.div`
  z-index: 1;
  max-height: 0;
  position: relative;
  margin-left: auto;
  margin-right: auto;
  max-width: ${props => (props.width ? props.width : "100%")};
  width: 100%;
  transition: max-height 0.15s linear, opacity 0.15s linear;

  ${props =>
    props.isEditing &&
    `
    z-index: -1;
  `} &:last-child {
    opacity: 1;
    margin-top: 15px;
  }
  ${props =>
    props.isOpen &&
    `
    max-height: inherit;
  `};

  ${props =>
    props.isVisible &&
    !props.isHero &&
    `
    padding-bottom: 40px;
  `};
`

export const SectionToolIcon = styled.div`
  ${avantgarde("s13")};
  position: relative;
  cursor: pointer;
  top: -6px;
  opacity: 0;
  transition: opacity 0.15s ease-out;

  svg {
    z-index: 1;
    width: 40px;
    height: 40px;
    position: absolute;
    left: -18px;
    top: -13px;
  }
  path {
    transition: fill 0.1s;
  }
  &::before {
    content: ".";
    border-top: 2px solid black;
    position: absolute;
    top: 6px;
    left: 16px;
    max-width: 0;
    width: calc(${props => props.width} - 16px);
    color: transparent;
    opacity: 0;
    transition: opacity 0.15s ease-out, max-width 0.15s ease-out;
    height: 20px;
    z-index: 2;
  }
  ${props =>
    (props.isVisible || props.isOpen) &&
    `
    opacity: 1;
  `};
  ${props =>
    props.isVisible &&
    !props.isOpen &&
    !props.isHero &&
    `
    &::after {
      content: 'Add a section';
      width: 150px;
      display: block;
      float: left;
      position: absolute;
      top: -3px;
      left: 35px;
    }
  `} &:hover {
    opacity: 1;
    path {
      fill: black;
    }
    &::before {
      max-width: 100%;
      opacity: 1;
    }
    &::after {
      display: none;
    }
  }
`

const SectionToolMenu = styled.ul`
  display: flex;
  border: 2px solid black;
  position: relative;
  left: 0;
  width: 100%;
  overflow: hidden;
`

const SectionToolMenuItem = styled.li`
  ${avantgarde("s11")};
  background: white;
  height: 89px;
  border-right: 1px solid ${color("black10")};
  border-bottom: 1px solid ${color("black10")};
  vertical-align: top;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;

  &:last-child {
    border-right: none;
  }

  svg {
    max-width: 40px;
    max-height: 35px;
    height: 35px;
    margin-bottom: 5px;
  }
`

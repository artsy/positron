import { color } from "@artsy/palette"
import { IconDrag } from "@artsy/reaction/dist/Components/Publishing/Icon/IconDrag"
import { getSectionWidth } from "@artsy/reaction/dist/Components/Publishing/Sections/SectionContainer"
import {
  ArticleData,
  SectionData,
} from "@artsy/reaction/dist/Components/Publishing/Typings"
import { removeSection } from "client/actions/edit/sectionActions"
import { maybeRemoveEmptyText } from "client/actions/edit/textSectionActions"
import { ErrorBoundary } from "client/components/error/error_boundary"
import { RemoveButton } from "client/components/remove_button"
import React, { Component, Fragment } from "react"
import { connect } from "react-redux"
// TODO: Remove sd after text2 is merged
import { data as sd } from "sharify"
import styled from "styled-components"
import { SectionEmbed } from "../sections/embed"
import SectionImages from "../sections/images"
import { SectionSocialEmbed } from "../sections/social_embed"
import SectionText from "../sections/text"
import SectionText2 from "../sections/text/index2"
import SectionVideo from "../sections/video"
const SectionSlideshow = require("../sections/slideshow/index.coffee")

interface SectionContainerProps {
  article: ArticleData
  editing: boolean
  index: number
  isHero?: boolean
  maybeRemoveEmptyTextAction: (i: number) => void
  onRemoveHero: () => void
  onSetEditing: (edit: boolean | number | null) => void
  removeSectionAction: (i: number) => void
  section: SectionData
  sections: SectionData[]
  sectionIndex: number
}

export class SectionContainer extends Component<SectionContainerProps> {
  isEditing = () => {
    const { index, editing, isHero, sectionIndex } = this.props
    if (isHero) {
      return editing
    } else {
      return index === sectionIndex
    }
  }

  onSetEditing = () => {
    const {
      editing,
      index,
      isHero,
      onSetEditing,
      maybeRemoveEmptyTextAction,
    } = this.props

    let setEditing

    if (isHero) {
      // use boolean if article.hero_section
      setEditing = !editing
    } else {
      // use the section index if article.section
      setEditing = this.isEditing() ? null : index
    }
    if (this.isEditing()) {
      // check if text section is empty, remove section if so
      maybeRemoveEmptyTextAction(index)
    }
    onSetEditing(setEditing)
  }

  onRemoveSection = () => {
    const { index, isHero, onRemoveHero, removeSectionAction } = this.props

    if (isHero) {
      onRemoveHero()
    } else {
      removeSectionAction(index)
    }
  }

  getSectionComponent = () => {
    const { section } = this.props

    switch (section.type) {
      case "embed": {
        return <SectionEmbed {...this.props} />
      }
      case "social_embed": {
        return <SectionSocialEmbed {...this.props} />
      }
      case "image":
      case "image_set":
      case "image_collection": {
        return <SectionImages {...this.props} />
      }

      case "text": {
        if (sd.IS_EDIT_2) {
          return <SectionText2 {...this.props} />
        } else {
          return <SectionText {...this.props} />
        }
      }

      case "video": {
        return <SectionVideo {...this.props} />
      }

      case "slideshow": {
        return <SectionSlideshow {...this.props} />
      }
    }
  }

  render() {
    const { article, isHero, section } = this.props
    const sectionWidth = getSectionWidth(section, article.layout)
    const isEditing = this.isEditing()
    const isFillwidth = section.layout === "fillwidth"

    return (
      <ErrorBoundary>
        <SectionWrapper
          width={sectionWidth}
          isHero={isHero || false}
          isFillwidth={isFillwidth}
        >
          <HoverControls isEditing={isEditing} type={section.type}>
            {!isEditing && (
              <Fragment>
                {!isHero && (
                  <DragButtonContainer isFillwidth={isFillwidth}>
                    <IconDrag background={color("black30")} />
                  </DragButtonContainer>
                )}

                <RemoveButtonContainer isFillwidth={isFillwidth}>
                  <RemoveButton
                    onClick={this.onRemoveSection}
                    background={color("black30")}
                  />
                </RemoveButtonContainer>
                <ClickToEdit onClick={this.onSetEditing} />
              </Fragment>
            )}
          </HoverControls>

          {this.getSectionComponent()}
          {isEditing &&
            section.type !== "text" && (
              <ContainerBackground onClick={this.onSetEditing} />
            )}
        </SectionWrapper>
      </ErrorBoundary>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
  sectionIndex: state.edit.sectionIndex,
})

const mapDispatchToProps = {
  removeSectionAction: removeSection,
  maybeRemoveEmptyTextAction: maybeRemoveEmptyText,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionContainer)

const SectionWrapper = styled.div<{
  isFillwidth: boolean
  width: string
  isHero: boolean
}>`
  position: relative;
  width: ${props => props.width};
  max-width: 100%;
  margin: 0 auto;
  padding: ${props => (props.isFillwidth ? 0 : "20px")};

  ${props =>
    props.isHero &&
    `
    margin-top: 20px;
  `};
`

export const HoverControls = styled.div<{ isEditing: boolean; type: string }>`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1px solid ${color("black30")};
  top: 0;
  left: 0;
  opacity: 0;
  &:hover {
    opacity: 1;
  }
  ${props =>
    props.isEditing &&
    `
    opacity: 1;
    border-color: ${
      props.type === "text" ? color("white100") : color("black100")
    };
  `};
`

export const ClickToEdit = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`

// TODO: Replace with ModalBackground
export const ContainerBackground = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
`

const IconContainer = styled.div<{ isFillwidth: boolean }>`
  width: 30px;
  position: absolute;
  right: -15px;
  cursor: pointer;
  z-index: 5;
  ${props =>
    props.isFillwidth &&
    `
    right: 18px;
  `};
`

const RemoveButtonContainer = styled(IconContainer)<{ isFillwidth: boolean }>`
  top: -15px;
  &:hover circle {
    fill: ${color("red100")};
  }
  ${props =>
    props.isFillwidth &&
    `
    top: 20px;
  `};
`

const DragButtonContainer = styled(IconContainer)<{ isFillwidth: boolean }>`
  top: 25px;
  ${props =>
    props.isFillwidth &&
    `
    top: 60px;
  `};
`

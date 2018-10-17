import PropTypes from "prop-types"
import React, { Component } from "react"
import styled from "styled-components"
import { color } from "@artsy/palette"
import { connect } from "react-redux"
import { IconDrag } from "@artsy/reaction/dist/Components/Publishing/Icon/IconDrag"
import { RemoveButton } from "client/components/remove_button"
import { removeSection } from "client/actions/edit/sectionActions"
import { getSectionWidth } from "@artsy/reaction/dist/Components/Publishing/Sections/SectionContainer"
import SectionImages from "../sections/images"
import SectionSlideshow from "../sections/slideshow"
import SectionText from "../sections/text"
import SectionText2 from "../sections/text/index2"
import SectionVideo from "../sections/video"
import { ErrorBoundary } from "client/components/error/error_boundary"
import { SectionEmbed } from "../sections/embed"
import { SectionSocialEmbed } from "../sections/social_embed"
// TODO: Remove after text2 is merged
import { data as sd } from "sharify"

export class SectionContainer extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    index: PropTypes.number,
    isHero: PropTypes.bool,
    onRemoveHero: PropTypes.func,
    onSetEditing: PropTypes.func,
    removeSectionAction: PropTypes.func,
    section: PropTypes.object,
    sections: PropTypes.array,
    sectionIndex: PropTypes.number,
  }

  isEditing = () => {
    const { index, editing, isHero, sectionIndex } = this.props
    if (isHero) {
      return editing
    } else {
      return index === sectionIndex
    }
  }

  onSetEditing = () => {
    const { editing, index, isHero, onSetEditing } = this.props

    let setEditing

    if (isHero) {
      // use boolean if article.hero_section
      setEditing = !editing
    } else {
      // use the section index if article.section
      setEditing = this.isEditing() ? null : index
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
    const { layout, type } = section
    const sectionWidth = getSectionWidth(section, article.layout)
    const isEditing = this.isEditing()
    const isFillwidth = section.layout === "fillwidth"

    return (
      <ErrorBoundary>
        <SectionWrapper
          className="SectionContainer"
          data-editing={isEditing}
          data-type={type} // TODO: remove css dependent on data-type & editing
          width={sectionWidth}
          isHero={isHero}
          isFillwidth={isFillwidth}
        >
          <HoverControls
            onClick={this.onSetEditing}
            isEditing={isEditing}
            type={type}
          >
            {!isEditing &&
              <>
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
              </>
            }
          </HoverControls>

          {this.getSectionComponent()}

          {isEditing &&
            <ContainerBackground onClick={this.onSetEditing} />
          }
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
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionContainer)

const SectionWrapper = styled.div`
  position: relative;
  width: ${props => props.width};
  max-width: 100%;
  margin: 0 auto;
  padding: ${props => props.isFillwidth ? 0 : "20px"};

  ${props => props.isHero && `
    margin-top: 20px;
  `}
`

export const HoverControls = styled.div`
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
  ${props => props.isEditing && `
    opacity: 1;
    border-color: ${props.type === "text" ? color("white100") : color("black100")};
  `}
`

const ContainerBackground = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
`

const IconContainer = styled.div`
  width: 30px;
  position: absolute;
  right: -15px;
  cursor: pointer;
  ${props => props.isFillwidth && `
    right: 18px;
  `}
`

const RemoveButtonContainer = styled(IconContainer)`
  top: -15px;
  &:hover circle {
    fill: ${color("red100")}
  }
  ${props => props.isFillwidth && `
    top: 20px;
  `}
`

const DragButtonContainer = styled(IconContainer)`
  top: 25px;
  ${props => props.isFillwidth && `
    top: 60px;
  `}
`

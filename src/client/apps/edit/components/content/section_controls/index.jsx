/**
 * A container for section inputs
 * Position changes on scroll to stick to section top
 **/

import styled from "styled-components"
import PropTypes from "prop-types"
import React, { Component } from "react"
import { color } from "@artsy/palette"
import { connect } from "react-redux"
import LayoutControls from "./layout"
import { getSectionWidth } from "@artsy/reaction/dist/Components/Publishing/Sections/SectionContainer"

export class SectionControls extends Component {
  static propTypes = {
    channel: PropTypes.object,
    children: PropTypes.any,
    disabledAlert: PropTypes.func,
    isHero: PropTypes.bool,
    showLayouts: PropTypes.bool,
    section: PropTypes.object
  }

  state = {
    insideComponent: false,
  }

  componentDidMount = () => {
    this.setInsideComponent()

    window.addEventListener("scroll", this.setInsideComponent)
  }

  componentWillUnmount = () => {
    window.removeEventListener("scroll", this.setInsideComponent)
  }

  setInsideComponent = () => {
    const insideComponent = this.insideComponent()

    if (insideComponent !== this.state.insideComponent) {
      this.setState({ insideComponent })
    }
  }

  getHeaderHeight = () => {
    const { type } = this.props.channel
    // Add extra space for channels with Yoast
    return type === "partner" ? 55 : 95
  }

  getPositionBottom = () => {
    const sectionPadding = 20
    const { insideComponent } = this.state
    const { isHero } = this.props

    if (this.controls) {
      const controlsHeight = $(this.controls).height()
      const windowHeight = window.innerHeight
      const headerHeight = this.getHeaderHeight()

      const stickyBottom = windowHeight - controlsHeight - headerHeight

      if (insideComponent && !isHero) {
        return stickyBottom + "px"
      }
    }
    return `calc(100% + ${sectionPadding}px)`
  }

  isScrollingOver = $section => {
    if (this.controls) {
      const controlsHeight = $(this.controls).height()
      const offsetTop = $section.offset().top

      const scrollPlusHeader = window.scrollY + this.getHeaderHeight()
      const offsetMinusControls = offsetTop - controlsHeight

      return scrollPlusHeader > offsetMinusControls
    }
  }

  isScrolledPast = $section => {
    if (this.controls) {
      const controlsHeight = $(this.controls).height()
      const sectionHeight = $section.height()
      const offsetTop = $section.offset().top
      const scrollPosition = window.scrollY

      const scrollPlusControls = scrollPosition + controlsHeight
      const scrollPlusSection = offsetTop + sectionHeight

      return scrollPlusControls > scrollPlusSection
    }
  }

  insideComponent = () => {
    const { isHero } = this.props
    if (this.controls) {
      const $section = $(this.controls).closest("section")

      let insideComponent = false
      const isScrollingOver = this.isScrollingOver($section)
      const isScrolledPast = this.isScrolledPast($section)

      if ($section && !isHero) {
        if (
          (isScrollingOver && !isScrolledPast) ||
          (isHero && !isScrollingOver)
        ) {
          insideComponent = true
        }
      }
      return insideComponent
    }
  }

  render() {
    const { article, children, disabledAlert, isHero, section, showLayouts } = this.props
    const { insideComponent } = this.state

    const outsidePosition = isHero ? "relative" : "absolute"
    const position = insideComponent ? "fixed" : outsidePosition
    const bottom = this.getPositionBottom()
    const sectionWidth = getSectionWidth(section, article.layout)
    const isFillwidth = !isHero && section.layout === "fillwidth"

    return (
      <SectionControlsContainer
        innerRef={node => {
          this.controls = node
        }}
        className="edit-controls"
        position={position}
        bottom={bottom}
        isFillwidth={isFillwidth}
        isHero={isHero}
        width={sectionWidth}
        type={!isHero ? section.type : undefined}
      >
        {showLayouts && <LayoutControls disabledAlert={disabledAlert} />}

        <div className="edit-controls__inputs">{children}</div>
      </SectionControlsContainer>
    )
  }
}
const mapStateToProps = state => ({
  article: state.edit.article,
  channel: state.app.channel,
  section: state.edit.section
})

export default connect(mapStateToProps)(SectionControls)

const SectionControlsContainer = styled.div`
  bottom: ${props => props.bottom};
  position: ${props => props.position};
  width: ${props => props.width};
  margin-left: ${props => props.isFillwidth ? 0 : "-20px"};
  background: ${color("black100")};
  z-index: 5;
  max-width: calc(100vw - 110px);
  ${props => props.type === "social_embed" && `
    padding-top: 20px;
  `}

  ${props => props.isHero && `
    width: calc(100% + 40px);
    padding-top: 20px;
    margin-top: -20px;
  `}
`

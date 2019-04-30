import { Box, color } from "@artsy/palette"
import { getSectionWidth } from "@artsy/reaction/dist/Components/Publishing/Sections/SectionContainer"
import {
  ArticleData,
  SectionData,
} from "@artsy/reaction/dist/Components/Publishing/Typings"
import { Channel } from "client/typings"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import LayoutControls from "./layout"

interface Props {
  article: ArticleData
  channel: Channel
  children: React.ReactElement
  disabledAlert: () => void
  isHero: boolean
  showLayouts: boolean
  section: SectionData
}

/*
 * A container for section inputs
 * Position changes on scroll to stick to section top
 */
export class SectionControls extends Component<Props> {
  private controls

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
    return type === "partner" ? 55 : 89
  }

  getPositionBottom = () => {
    const { insideComponent } = this.state
    const { isHero } = this.props

    if (this.controls) {
      const controlsHeight = $(this.controls).height() || 0
      const windowHeight = window.innerHeight
      const headerHeight = this.getHeaderHeight()

      const stickyBottom = windowHeight - controlsHeight - headerHeight

      if (insideComponent && !isHero) {
        return stickyBottom + "px"
      }
    }
    return "100%"
  }

  isScrollingOver = $section => {
    if (this.controls) {
      const controlsHeight = $(this.controls).height() || 0
      const offsetTop = $section.offset().top

      const scrollPlusHeader = window.scrollY + this.getHeaderHeight()
      const offsetMinusControls = offsetTop - controlsHeight

      return scrollPlusHeader > offsetMinusControls
    }
  }

  isScrolledPast = $section => {
    if (this.controls) {
      const controlsHeight = $(this.controls).height() || 0
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
    const {
      article,
      children,
      disabledAlert,
      isHero,
      section,
      showLayouts,
    } = this.props
    const { insideComponent } = this.state

    const outsidePosition = isHero ? "relative" : "absolute"
    const position = insideComponent ? "fixed" : outsidePosition
    const bottom = this.getPositionBottom()
    const sectionWidth = getSectionWidth(section, article.layout)
    const isFillwidth = !isHero && section.layout === "fillwidth"

    return (
      <SectionControlsContainer
        ref={node => {
          this.controls = node
        }}
        position={position}
        bottom={bottom}
        isFillwidth={isFillwidth}
        isHero={isHero}
        width={sectionWidth}
        type={!isHero ? section.type : undefined}
      >
        {showLayouts && <LayoutControls disabledAlert={disabledAlert} />}

        <Inputs p="0 20px 20px">{children}</Inputs>
      </SectionControlsContainer>
    )
  }
}
const mapStateToProps = state => ({
  article: state.edit.article,
  channel: state.app.channel,
  section: state.edit.section,
})

export default connect(mapStateToProps)(SectionControls)

const SectionControlsContainer = styled.div<{
  bottom: string
  position: string
  width: string
  isFillwidth?: boolean
  isHero?: boolean
  type?: string
}>`
  bottom: ${props => props.bottom};
  position: ${props => props.position};
  width: ${props => props.width};
  margin-left: ${props => (props.isFillwidth ? 0 : "-20px")};
  background: ${color("black100")};
  z-index: 5;
  max-width: calc(100vw - 110px);

  ${props =>
    props.type === "social_embed" &&
    `
    padding-top: 20px;
  `};

  ${props =>
    props.isHero &&
    `
    width: calc(100% + 40px);
    padding-top: 20px;
    margin-top: -20px;
  `};
`

const Inputs = styled(Box)`
  input {
    width: 100%;
    margin-bottom: 20px;
  }

  .file-input__upload-container h2 {
    margin: 0;
  }
`

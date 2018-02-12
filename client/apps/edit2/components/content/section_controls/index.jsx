/**
 * A container for section inputs
 * Position changes on scroll to stick to section top
**/

import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import LayoutControls from './layout'

export class SectionControls extends Component {
  static propTypes = {
    channel: PropTypes.object,
    children: PropTypes.any,
    disabledAlert: PropTypes.func,
    isHero: PropTypes.bool,
    showLayouts: PropTypes.bool
  }

  state = {
    insideComponent: false
  }

  componentDidMount = () => {
    this.setInsideComponent()

    window.addEventListener(
      'scroll',
      this.setInsideComponent
    )
  }

  componentWillUnmount = () => {
    window.removeEventListener(
      'scroll',
      this.setInsideComponent
    )
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
    return type === 'partner' ? 55 : 95
  }

  getPositionBottom = () => {
    if (this.controls) {
      const { insideComponent } = this.state
      const { isHero } = this.props

      const controlsHeight = $(this.controls).height()
      const windowHeight = window.innerHeight
      const headerHeight = this.getHeaderHeight()

      const stickyBottom = windowHeight - controlsHeight - headerHeight

      if (insideComponent && !isHero) {
        return stickyBottom + 'px'
      } else {
        return '100%'
      }
    }
  }

  isScrollingOver = ($section) => {
    if (this.controls) {
      const controlsHeight = $(this.controls).height()
      const offsetTop = $section.offset().top

      const scrollPlusHeader = window.scrollY + this.getHeaderHeight()
      const offsetMinusControls = offsetTop - controlsHeight

      return scrollPlusHeader > offsetMinusControls
    }
  }

  isScrolledPast = ($section) => {
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
      const $section = $(this.controls).closest('section')

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

  render () {
    const {
      children,
      disabledAlert,
      isHero,
      showLayouts
    } = this.props
    const { insideComponent } = this.state

    const outsidePosition = isHero ? 'relative' : 'absolute'
    const position = insideComponent ? 'fixed' : outsidePosition
    const bottom = this.getPositionBottom()

    return (
      <SectionControlsContainer
        innerRef={(node) => { this.controls = node }}
        className={'SectionControls edit-controls'}
        position={position}
        bottom={bottom}
      >

        {showLayouts &&
          <LayoutControls
            disabledAlert={disabledAlert}
          />
        }

        <div className='edit-controls__inputs'>
          {children}
        </div>

      </SectionControlsContainer>
    )
  }
}
const mapStateToProps = (state) => ({
  channel: state.app.channel
})

export default connect(
  mapStateToProps
)(SectionControls)

const SectionControlsContainer = styled.div`
  bottom: ${props => props.bottom};
  position: ${props => props.position};
`

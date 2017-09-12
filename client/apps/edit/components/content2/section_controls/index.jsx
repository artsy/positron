import React, { Component } from 'react'
const _ = require('underscore')
import components from '@artsy/reaction-force/dist/components/publishing/index'
const IconImageFullscreen = components.Icon.ImageFullscreen

export default class SectionControls extends Component {
  constructor (props) {
    super(props)

    this.state = {
      insideComponent: false
    }
  }

  componentDidMount() {
    this.setInsideComponent()
    return window.addEventListener('scroll', this.setInsideComponent)
  }

  componentWillUnmount() {
    return window.removeEventListener('scroll', this.setInsideComponent)
  }

  setInsideComponent = () => {
    const insideComponent = this.insideComponent()
    if (insideComponent !== this.state.insideComponent) {
      return this.setState({ insideComponent })
    }
  }

  getHeaderSize() {
    return  this.props.channel.isEditorial() ? 95 : 55
  }

  getControlsWidth() {
    // used for classic layout only
    const { section } = this.props
    if (this.props.isHero) {
      return 1100
    } else if (section.get('layout').includes('overflow') ||
     (section.get('type') === 'image_set')) {
      return 900
    } else {
      return 620
    }
  }

  getPositionLeft() {
    if (this.state.insideComponent) {
      return ((window.innerWidth / 2) - (this.getControlsWidth() / 2)) + 55
    } else {
      if (this.props.articleLayout === 'classic') {
        return '20px'
      } else {
        return 0
      }
    }
  }

  getPositionBottom() {
    if (this.state.insideComponent) {
      return window.innerHeight - $(this.refs.controls).height() - this.getHeaderSize()
    } else {
      return '100%'
    }
  }

  isScrollingOver($section) {
    const scrollPlusHeader = window.scrollY + this.getHeaderSize()
    const offsetMinusControls = $section.offset().top - $(this.refs.controls).height()
    return scrollPlusHeader > offsetMinusControls
  }

  isScrolledPast($section) {
    const scrollPlusControls = window.scrollY + $(this.refs.controls).height()
    const scrollPlusSection = $section.offset().top + $section.height()
    return scrollPlusControls > scrollPlusSection
  }

  insideComponent = () => {
    const $section = $(this.refs.controls) ? $(this.refs.controls).closest('section') : false
    let insideComponent = false
    if ($section) {
      if ((this.isScrollingOver($section) && !this.isScrolledPast($section)) ||
       (this.props.isHero && !this.isScrolledPast($section))) {
        insideComponent = true
      }
    }
    return insideComponent
  }

  changeLayout(layout) {
    if (this.props.section.get('type') === 'image_set') {
      this.props.section.set('type', 'image_collection')
      this.forceUpdate()
    }
    this.props.section.set({ layout })
    if (this.props.onChange) {
      return this.props.onChange()
    }
  }

  toggleImageSet = () => {
    if (this.props.section.get('type') === 'image_collection') {
      this.props.section.unset('layout')
      this.props.section.set('type', 'image_set')
      this.forceUpdate()
    }
    if (this.props.onChange) {
      return this.props.onChange()
    }
  }

  hasImageSet() {
    const sectionisImage = ['image_set', 'image_collection'].includes(
      this.props.section.get('type')
    )
    return this.props.channel.hasFeature('image_set') && sectionisImage
  }

  renderSectionLayouts(sectionLayouts, section) {
    if (sectionLayouts) {
      return (
        <nav className='edit-controls__layout'>
          <a
            name='overflow_fillwidth'
            className='layout'
            onClick={() => this.changeLayout('overflow_fillwidth')}
            data-active={section.get('layout') === 'overflow_fillwidth'} />
          <a
            name='column_width'
            className='layout'
            onClick={() => this.changeLayout('column_width')}
            data-active={section.get('layout') === 'column_width'} />
          {
            this.props.articleLayout === 'feature' &&
            <a
              name='fillwidth'
              className='layout'
              onClick={() => this.changeLayout('fillwidth')}
              data-active={section.get('layout') === 'fillwidth'}>
              <IconImageFullscreen fill={'white'} />
            </a>
          }
          { this.hasImageSet() &&
            <a
              name='image_set'
              className='layout'
              onClick={this.toggleImageSet}
              data-active={section.get('type') === 'image_set'} />
          }
        </nav>
      )
    }
  }

  render() {
    const { articleLayout, section, sectionLayouts } = this.props
    const { insideComponent } = this.state
    const isSticky = insideComponent ? ' sticky' : ''

    return (
      <div
        ref='controls'
        className={'edit-controls' + isSticky}
        style={{
          color: 'white',
          position: insideComponent ? 'fixed' : 'absolute',
          bottom: this.getPositionBottom(),
          left: articleLayout === 'classic' ? this.getPositionLeft() : ''
      }}>
        {this.renderSectionLayouts(sectionLayouts, section)}
        <div className='edit-controls__inputs'>
          {this.props.children}
        </div>
      </div>
    )
  }
}

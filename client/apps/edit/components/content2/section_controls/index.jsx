import React, { Component } from 'react'
import _ from 'underscore'

export default class SectionControls extends Component {
  constructor (props) {
    super(props)
    this.state = {
      insideComponent: false
    }
    this.changeLayout = this.changeLayout.bind(this)
    this.insideComponent = this.insideComponent.bind(this)
    this.setInsideComponent = this.setInsideComponent.bind(this)
    window.addEventListener('scroll', this.setInsideComponent)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.setInsideComponent)
  }

  setInsideComponent() {
    const insideComponent = this.insideComponent()
    if (insideComponent !== this.state.insideComponent) {
      this.setState({ insideComponent })
    }
  }

  insideComponent() {
    const $section = $(this.refs.controls).closest('section')
    let insideComponent = false
    if ($section) {
      if ((this.isScrollingOver($section) && !this.isScrolledPast($section)) ||
       (this.props.isHero && !this.isScrolledPast($section))) {
        insideComponent = true
      }
    }
    return insideComponent
  }

  getHeaderSize() {
    const height = this.props.channel.isEditorial() ? 95 : 55
    return height
  }

  getControlsWidth() {
    // used for classic layout only
    let width
    const sectionType = this.props.section.get('type')
    const sectionLayout = this.props.section.get('layout')
    if (this.props.isHero || ((sectionType === 'embed') && (sectionLayout === 'overflow'))) {
      width = 1100
    } else if (
        (sectionLayout != null ? sectionLayout.includes('overflow') : undefined) ||
        (sectionType === 'image_set')
      ) {
      width = 940
    } else {
      width = 620
    }
    return width
  }

  getPositionLeft() {
    let left = 0
    if (this.state.insideComponent) {
      left = ((window.innerWidth / 2) - (this.getControlsWidth() / 2)) + 55
    }
    return left
  }

  getPositionBottom() {
    let bottom, type
    const isImages = (type = this.props.section.get('type'), ['image_set', 'image_collection'].includes(type))
    if (this.state.insideComponent) {
      bottom = window.innerHeight - $(this.refs.controls).height() - this.getHeaderSize()
      if (isImages) {
        bottom = bottom - 20
      }
    } else {
      bottom = isImages ? 'calc(100% + 20px)' : '100%'
    }
    return bottom
  }

  isScrollingOver($section) {
    return (window.scrollY + this.getHeaderSize()) > ($section.offset().top - $(this.refs.controls).height());
  }

  isScrolledPast($section) {
    return (window.scrollY + $(this.refs.controls).height()) > ($section.offset().top + $section.height());
  }

  changeLayout(e) {
    if (this.props.section.get('type') === 'image_set') {
      this.props.section.set('type', 'image_collection')
      this.forceUpdate()
    }
    e = e.target ? e.target.name : e
    this.props.section.set({layout: e})
    if (this.props.onChange) { this.props.onChange() }
  }

  toggleImageSet() {
    if (this.props.section.get('type') === 'image_collection') {
      this.props.section.unset('layout')
      this.props.section.set('type', 'image_set')
      this.forceUpdate()
    }
    if (this.props.onChange) { this.props.onChange() }
  }

  renderSectionLayouts() {
    const type = this.props.section.get('type')
    const layout = this.props.section.get('layout')
    const hasImageSet = type.includes('image') && this.props.channel.hasFeature('image_set')
    return(
      <nav className='edit-controls__layout'>
        <a
          name='overflow_fillwidth'
          className='layout'
          onClick={this.changeLayout}
          data-active={layout === 'overflow_fillwidth'}></a>
        <a
          name='column_width'
          className='layout'
          onClick={this.changeLayout}
          data-active={layout === 'column_width'}></a>
        {this.props.articleLayout === 'feature' &&
          <a
            name='fillwidth'
            className='layout'
            onClick={this.changeLayout}
            data-active={layout === 'fillwidth'}></a>}
        {hasImageSet &&
          <a
            name='image_set'
            className='layout'
            onClick={this.toggleImageSet}
            data-active={type === 'image_set'}></a>}
      </nav>
    )
  }

  render() {
    return (
      <header
        ref='controls'
        className='edit-controls'
        style={{
          position: this.state.insideComponent ? 'fixed' : 'absolute',
          bottom: this.getPositionBottom(),
          left: this.props.articleLayout === 'classic' && this.getPositionLeft()}}>
        {this.props.sectionLayouts && this.renderSectionLayouts()}
        <div className='edit-controls__inputs'>{this.props.children}</div>
      </header>
    )
  }
}

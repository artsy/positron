import React, { Component } from 'react'
import components from '@artsy/reaction-force/dist/components/publishing/index'
const IconImageFullscreen = components.Icon.ImageFullscreen

export default class SectionControls extends Component {
  constructor (props) {
    super(props)
    this.state = { insideComponent: false }
  }

  componentDidMount() {
    this.setInsideComponent()
    window.addEventListener('scroll', this.setInsideComponent)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.setInsideComponent)
  }

  setInsideComponent = () => {
    const insideComponent = this.insideComponent()

    if (insideComponent !== this.state.insideComponent) {
      this.setState({ insideComponent })
    }
  }

  getHeaderSize() {
    // Add extra space for channels with Yoast
    return  this.props.channel.isEditorial() ? 95 : 55
  }

  getPositionBottom() {
    if (this.state.insideComponent && !this.props.isHero) {
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
    let insideComponent = false
    const $section = $(this.refs.controls) && $(this.refs.controls).closest('section')

    if ($section && !this.props.isHero) {
      if ((this.isScrollingOver($section) && !this.isScrolledPast($section)) ||
       (this.props.isHero && !this.isScrolledPast($section))) {
        insideComponent = true
      }
    }
    return insideComponent
  }

  changeLayout(layout) {
    if (layout === 'fillwidth' && this.sectionIsImage() &&
     this.props.section.get('images').length > 1) {
      return this.props.disabledAlert()
    }
    if (this.props.section.get('type') === 'image_set') {
      this.props.section.set('type', 'image_collection')
      this.forceUpdate()
    }
    this.props.section.set({ layout })
    this.props.onChange && this.props.onChange()
  }

  toggleImageSet = () => {
    if (this.props.section.get('type') === 'image_collection') {
      this.props.section.set({type: 'image_set', layout: 'mini'})
      this.forceUpdate()
    }
    this.props.onChange && this.props.onChange()
  }

  hasImageSet() {
    return this.sectionIsImage() && this.props.channel.hasFeature('image_set')
  }

  sectionIsImage() {
    return this.props.section.get('type').includes('image')
  }

  sectionHasFullscreen(section) {
    const hasFullscreen = ['embed', 'video'].includes(section.get('type')) || this.sectionIsImage()
    return this.props.articleLayout === 'feature' && hasFullscreen
  }

  renderSectionLayouts(section) {
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
          this.sectionHasFullscreen(section) &&
          <a
            name='fillwidth'
            className='layout'
            onClick={() => this.changeLayout('fillwidth')}
            data-active={section.get('layout') === 'fillwidth'}>
            <IconImageFullscreen fill={'white'} />
          </a>
        }
        {
          this.hasImageSet() &&
          <a
            name='image_set'
            className='layout'
            onClick={this.toggleImageSet}
            data-active={section.get('type') === 'image_set'} />
        }
      </nav>
    )
  }

  render() {
    const { articleLayout, isHero, section, sectionLayouts } = this.props
    const { insideComponent } = this.state
    const isSticky = insideComponent ? ' sticky' : ''
    const outsidePosition = isHero ? 'relative' : 'absolute'

    return (
      <div
        ref='controls'
        className={ 'edit-controls' + isSticky }
        style={{
          position: insideComponent ? 'fixed' : outsidePosition,
          bottom: this.getPositionBottom()
      }}>
        { sectionLayouts &&
          this.renderSectionLayouts(section) }
        <div className='edit-controls__inputs'>
          {this.props.children}
        </div>
      </div>
    )
  }
}

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  IconEditEmbed,
  IconEditImages,
  IconEditSection,
  IconEditText,
  IconEditVideo,
  IconHeroImage,
  IconHeroVideo
} from '@artsy/reaction-force/dist/Components/Publishing'

export class SectionTool extends Component {
  static propTypes = {
    firstSection: PropTypes.bool,
    index: PropTypes.number,
    isEditing: PropTypes.bool,
    isHero: PropTypes.bool,
    onSetEditing: PropTypes.func,
    section: PropTypes.object,
    sections: PropTypes.object
  }

  state = {
    open: false
  }

  toggleOpen = () => {
    this.setState({open: !this.state.open})
  }

  getProps (type) {
    switch (type) {
      case 'video':
        return {
          type: 'video',
          url: '',
          layout: 'column_width'
        }
      case 'image_collection':
        return {
          type: 'image_collection',
          layout: 'overflow_fillwidth',
          images: []
        }
      case 'embed':
        return {
          type: 'embed',
          url: '',
          layout: 'column_width',
          height: ''
        }
      case 'text':
        return {
          type: 'text',
          body: ''
        }
    }
  }

  newSection = (type) => {
    this.props.sections.add(
      this.getProps(type),
      {at: this.props.index + 1}
    )
    this.setState({open: false})
  }

  setHero = (type) => {
    this.props.section.set(this.getProps(type))
    this.props.onSetEditing(true)
  }

  renderHeroMenu () {
    if (this.state.open) {
      return (
        <ul className='edit-tool__menu'>
          <li
            className='edit-tool__hero-image'
            onClick={() => this.setHero('image_collection')}>
            <IconHeroImage />
            Large Format Image
          </li>
          <li
            className='edit-tool__hero-video'
            onClick={() => this.setHero('video')}>
            <IconHeroVideo />
            Large Format Video
          </li>
        </ul>
      )
    }
  }

  renderSectionMenu () {
    if (this.state.open) {
      return (
        <ul className='edit-tool__menu'>
          <li
            className='edit-tool__edit-text'
            onClick={() => this.newSection('text')}>
            <IconEditText />
            Text
          </li>
          <li
            className='edit-tool__edit-images'
            onClick={() => this.newSection('image_collection')}>
            <IconEditImages />
            Images
          </li>
          <li
            className='edit-tool__edit-video'
            onClick={() => this.newSection('video')}>
            <IconEditVideo />
            Video
          </li>
          <li
            className='edit-tool__edit-embed'
            onClick={() => this.newSection('embed')}>
            <IconEditEmbed />
            Embed
          </li>
        </ul>
      )
    }
  }

  render () {
    const { firstSection, index, isEditing, isHero, sections } = this.props
    const isFirstSection = sections && firstSection && sections.length === 0
    const isLastSection = sections && index === sections.length - 1
    return (
      <div
        className={'edit-tool'}
        data-state-open={this.state.open}
        data-editing={isEditing}
        data-visible={isFirstSection || isLastSection}
        data-hero={isHero}>
        <div
          className='edit-tool__icon'
          onClick={this.toggleOpen}>
          <IconEditSection
            fill={this.state.open || !isHero ? '#000' : '#CCC'}
            isClosing={this.state.open} />
        </div>
        { isHero
          ? this.renderHeroMenu()
          : this.renderSectionMenu()
        }
      </div>
    )
  }
}

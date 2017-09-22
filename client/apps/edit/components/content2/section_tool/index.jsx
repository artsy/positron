import React, { Component } from 'react'
import components from '@artsy/reaction-force/dist/components/publishing/index'

const IconEditEmbed = components.Icon.EditEmbed
const IconEditImages = components.Icon.EditImages
const IconEditSection = components.Icon.EditSection
const IconEditText = components.Icon.EditText
const IconEditVideo = components.Icon.EditVideo

const IconHeroImage = components.Icon.HeroImage
const IconHeroVideo = components.Icon.HeroVideo

export default class SectionTool extends Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false
    }
  }

  toggleOpen = () => {
    this.setState({open: !this.state.open })
  }

  getProps(type) {
    if (type === 'video') {
      return {
        type: 'video',
        url: '',
        layout: 'column_width'
      }
    } else if (type === 'image_collection') {
      return {
        type: 'image_collection',
        layout: 'overflow_fillwidth',
        images: []
      }
    }
  }

  newSection = (type) => {
    switch (type) {
      case 'embed':
        this.props.sections.add({
          type: 'embed',
          url: '',
          layout: 'column_width',
          height: ''
        }, {at: this.props.index + 1})
      case 'image_collection':
        this.props.sections.add(
          this.getProps(type),
          {at: this.props.index + 1}
        )
      case 'text':
        this.props.sections.add({
          type: 'text',
          body: ''
        }, {at: this.props.index + 1})
      case 'video':
        this.props.sections.add(
          this.getProps(type),
          {at: this.props.index + 1}
        )
    }
    this.setState({open: false})
  }

  setHero = (type) => {
    this.props.section.set(this.getProps(type))
    this.props.onSetEditing(true)
  }

  renderHeroMenu() {
    return (
      <ul className='edit-tool__menu'>
        <li
          className='edit-tool__hero-image'
          onClick={ () => this.setHero('image_collection')}>
          <IconHeroImage />
          Large Format Image
        </li>
        <li
          className='edit-tool__hero-video'
          onClick={ () => this.setHero('video')}>
          <IconHeroVideo />
          Large Format Video
        </li>
      </ul>
    )
  }

  renderSectionMenu() {
    return (
      <ul className='edit-tool__menu'>
        <li
          className='edit-tool__edit-text'
          onClick={ () => this.newSection('text')}>
          <IconEditText />
          Text
        </li>
        <li
          className='edit-tool__edit-images'
          onClick={ () => this.newSection('image_collection')}>
          <IconEditImages />
          Images
        </li>
        <li
          className='edit-tool__edit-video'
          onClick={ () => this.newSection('video')}>
          <IconEditVideo />
          Video
        </li>
        <li
          className='edit-tool__edit-embed'
          onClick={ () => this.newSection('embed')}>
          <IconEditEmbed />
          Embed
        </li>
      </ul>
    )
  }

  render() {
    const { isEditing, isHero, sections } = this.props
    return (
      <div
        className='edit-tool'
        data-state-open={this.state.open}
        data-editing={isEditing}
        data-hero={isHero}>
        <div
          className='edit-tool__icon'
          onClick={this.toggleOpen}>
          <IconEditSection
            fill={this.state.open ? '#000' : '#CCC'}
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

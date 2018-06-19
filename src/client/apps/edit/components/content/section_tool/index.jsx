import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  IconEditEmbed,
  IconEditImages,
  IconEditSection,
  IconEditText,
  IconEditVideo,
  IconHeroImage,
  IconHeroVideo
} from '@artsy/reaction/dist/Components/Publishing'
import { newHeroSection, newSection } from 'client/actions/edit/sectionActions'

export class SectionTool extends Component {
  static propTypes = {
    article: PropTypes.object,
    firstSection: PropTypes.bool,
    index: PropTypes.number,
    isEditing: PropTypes.bool,
    isHero: PropTypes.bool,
    isPartnerChannel: PropTypes.bool,
    newHeroSectionAction: PropTypes.func,
    newSectionAction: PropTypes.func,
    onSetEditing: PropTypes.func,
    sections: PropTypes.array
  }

  state = {
    open: false
  }

  toggleOpen = () => {
    this.setState({open: !this.state.open})
  }

  newSection = (type) => {
    const { index, newSectionAction } = this.props

    newSectionAction(type, index + 1)
    this.setState({open: false})
  }

  setHero = (type) => {
    const { newHeroSectionAction, onSetEditing } = this.props

    newHeroSectionAction(type)
    this.setState({open: false})
    onSetEditing(true)
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
    const {
      article: { layout },
      firstSection,
      isPartnerChannel
    } = this.props
    const { open } = this.state
    const isNews = layout === 'news'

    if (open) {
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
            {isNews ? 'Image' : 'Images'}
          </li>
          {!isNews &&
            <li
              className='edit-tool__edit-video'
              onClick={() => this.newSection('video')}>
              <IconEditVideo />
              Video
            </li>
          }
          {!isPartnerChannel && !isNews &&
            <li
              className='edit-tool__edit-embed'
              onClick={() => this.newSection('embed')}>
              <IconEditEmbed />
              Embed
            </li>
          }
          {isNews && !firstSection &&
            <li
              className='edit-tool__edit-socialembed'
              onClick={() => this.newSection('social_embed')}>
              <IconEditEmbed />
              Social Embed
            </li>
          }
        </ul>
      )
    }
  }

  render () {
    const { firstSection, index, isEditing, isHero, sections } = this.props
    const { open } = this.state

    const isFirstSection = sections && firstSection && sections.length === 0
    const isLastSection = sections && index === sections.length - 1

    return (
      <div
        className={'edit-tool'}
        data-state-open={open}
        data-editing={isEditing}
        data-visible={isFirstSection || isLastSection}
        data-hero={isHero}
      >

        <div
          className='edit-tool__icon'
          onClick={this.toggleOpen}
        >
          <IconEditSection
            fill={open || !isHero ? '#000' : '#CCC'}
            isClosing={open}
          />
        </div>

        { isHero
          ? this.renderHeroMenu()
          : this.renderSectionMenu()
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article,
  isPartnerChannel: state.app.isPartnerChannel
})

const mapDispatchToProps = {
  newHeroSectionAction: newHeroSection,
  newSectionAction: newSection
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionTool)

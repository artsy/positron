import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { SectionVideo } from '../video/index.jsx'

import {
  IconLayoutFullscreen,
  IconLayoutSplit,
  IconLayoutText,
  IconLayoutBasic
 } from '@artsy/reaction-force/dist/Components/Publishing'

export default class FeatureHeaderControls extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    hero: PropTypes.object
  }

  state = {
    isLayoutOpen: false,
    isVideoOpen: false
  }

  onChangeLayout = (type) => {
    this.props.onChange('type', type)
  }

  getMenuColor = () => {
    const { hero } = this.props

    if (hero && hero.type === 'fullscreen' && hero.url && hero.url.length) {
      return 'white'
    } else {
      return 'black'
    }
  }

  toggleLayoutControls = () => {
    const { isLayoutOpen, isVideoOpen } = this.state

    this.setState({
      isLayoutOpen: !isLayoutOpen
    })

    if (isVideoOpen) {
      this.toggleVideoControls() // hide
    }

  }

  toggleVideoControls = () => {
    const { isLayoutOpen, isVideoOpen } = this.state

    this.setState({
      isVideoOpen: !isVideoOpen
    })

    if (isLayoutOpen) {
      this.toggleLayoutControls()
    }
  }

  renderVideoEmbed () {
    const { article } = this.props

    if (this.state.isVideoOpen) {
      return (
        <div
          className='edit-section-container'
          data-editing
          data-type='video'
        >
          <SectionVideo editing
            article={article}
            section={article.heroSection}
            channel={{ isArtsyChannel: () => false }}
            headerType={'basic-embed'}
          />
        </div>
      )
    }
  }

  renderLayouts () {
    if (this.state.isLayoutOpen) {
      return (
        <div className='edit-header--controls__layout'>
          <a
            onClick={() => this.onChangeLayout('text')}
            name='text'>
            <IconLayoutText />
            Default
          </a>
          <a
            onClick={() => this.onChangeLayout('fullscreen')}
            name='fullscreen'>
            <IconLayoutFullscreen />
            Overlay
          </a>
          <a
            onClick={() => this.onChangeLayout('split')}
            name='split'>
            <IconLayoutSplit />
            Split
          </a>
          <a
            onClick={() => this.onChangeLayout('basic')}
            name='basic'>
            <IconLayoutBasic />
            Basic
          </a>
        </div>
      )
    }
  }

  renderModal () {
    const { isLayoutOpen, isVideoOpen } = this.state
    const showModal = isLayoutOpen || isVideoOpen

    if (showModal) {
      const toggleControls = isLayoutOpen
        ? this.toggleLayoutControls
        : this.toggleVideoControls

      return (
        <div
          onClick={toggleControls}
          className='edit-header--controls__bg'
        />
      )
    }
  }

  render () {
    const isBasicFeature = this.props.hero.type === 'basic'

    return (
      <div className='edit-header__container'>
        {this.renderModal()}

        { isBasicFeature &&
          <div className='edit-header--video'>
            <div onClick={this.toggleVideoControls}>
              Add Video Embed
            </div>
            <div>
              {this.renderVideoEmbed()}
            </div>
          </div>
        }

        <div className='edit-header--controls'>
          <div className='edit-header--controls__menu'>
            <div
              onClick={this.toggleLayoutControls}
              className='edit-header--controls-open'
              style={{color: this.getMenuColor()}}
            >
              Change Header
            </div>
            {this.renderLayouts()}
          </div>
        </div>
      </div>
    )
  }
}

import Backbone from 'backbone'
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
  state = {
    isOpen: false,
    isVideoEmbedOpen: true
  }

  toggleVideoEmbedControls = () => {
    this.setState({isVideoEmbedOpen: !this.state.isVideoEmbedOpen})
  }

  toggleLayoutControls = () => {
    this.setState({isOpen: !this.state.isOpen})
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

  renderVideoEmbed () {
    const props = {
      section: new Backbone.Model({
        type: 'video',
        url: 'https://www.youtube.com/watch?v=PXi7Kjlsz9A',
        caption: '<p>What motivates patrons to fund artists’ wildest dreams?</p>',
        cover_image_url: 'https://artsy-media-uploads.s3.amazonaws.com/IB6epb5L_l0rm9btaDsY7Q%2F14183_MDP_Evening_240.jpg',
      }),
      article: new Backbone.Model({layout: 'feature'}),
      channel: {
        isArtsyChannel: () => false
      },
      editing: true
    }

    if (this.state.isVideoEmbedOpen) {
      return (
        <div
          className='edit-section-container'
          data-editing
          data-type='video'
        >
          <SectionVideo {...props} />
        </div>
      )
    }
  }

  renderLayouts () {
    if (this.state.isOpen) {
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
    if (this.state.isOpen) {
      return (
        <div
          onClick={this.toggleLayoutControls}
          className='edit-header--controls__bg'
        />
      )
    }
  }

  render () {
    const isBasicFeature = this.props.hero.type === 'basic'

    return (
      <div className='edit-header__container'>
        { isBasicFeature &&
          <div className='edit-header--video'>
            <div onClick={this.toggleVideoEmbedControls}>
              Add Video Embed
            </div>
            <div>
              {this.renderVideoEmbed()}
            </div>
          </div>
        }


        <div className='edit-header--controls'>
          {this.renderModal()}

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

FeatureHeaderControls.propTypes = {
  onChange: PropTypes.func.isRequired,
  hero: PropTypes.object
}

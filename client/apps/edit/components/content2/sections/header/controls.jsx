import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  IconLayoutFullscreen,
  IconLayoutSplit,
  IconLayoutText
 } from '@artsy/reaction-force/dist/Components/Publishing'

export default class FeatureHeaderControls extends Component {
  constructor (props) {
    super(props)
    this.state = { isOpen: false }
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
        </div>
      )
    }
  }

  renderModal () {
    if (this.state.isOpen) {
      return (
        <div
          onClick={this.toggleLayoutControls}
          className='edit-header--controls__bg' />
      )
    }
  }

  render () {
    return (
      <div className='edit-header--controls'>
        {this.renderModal()}
        <div className='edit-header--controls__menu'>
          <div
            onClick={this.toggleLayoutControls}
            className='edit-header--controls-open'
            style={{color: this.getMenuColor()}}>Change Header</div>
            {this.renderLayouts()}
        </div>
      </div>
    )
  }
}

FeatureHeaderControls.propTypes = {
  onChange: PropTypes.func.isRequired,
  hero: PropTypes.object
}

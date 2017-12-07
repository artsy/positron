import PropTypes from 'prop-types'
import React, { Component } from 'react'

import {
  IconLayoutFullscreen,
  IconLayoutSplit,
  IconLayoutText,
  IconLayoutBasic
} from '@artsy/reaction-force/dist/Components/Publishing'

export default class LayoutControls extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    hero: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired
  }

  getMenuColor = () => {
    const { hero } = this.props
    const { type, url } = hero

    if (hero && type === 'fullscreen' && url && url.length) {
      return 'white'
    } else {
      return 'black'
    }
  }

  onChangeLayout = (type) => {
    this.props.onChange('type', type)
  }

  render () {
    const { isOpen, onClick } = this.props

    return (
      <div className='edit-header--controls'>
        <div className='edit-header--controls__menu'>
          <div
            onClick={onClick}
            className='edit-header--controls-open'
            style={{color: this.getMenuColor()}}
          >
            Change Header
          </div>

          {isOpen &&
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
          }
        </div>
      </div>
    )
  }
}

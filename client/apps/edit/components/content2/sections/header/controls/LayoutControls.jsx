import _ from 'underscore'
import * as appActions from 'client/actions/appActions'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  IconLayoutFullscreen,
  IconLayoutSplit,
  IconLayoutText,
  IconLayoutBasic
} from '@artsy/reaction-force/dist/Components/Publishing'

@connect(state => {
  return {
    status: state.app.status + ' hi!' // Feel free to modify data before its passed into component
  }
}, (dispatch) => {
  return {
    // Can also use expanded form of bindActionCreators to customize action props
    // before they're injected into components
    loginAction: _.debounce(() => dispatch(appActions.login()), 500, false)
  }
})
export default class LayoutControls extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    hero: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired
  }

  getMenuColor = () => {
    const { hero } = this.props

    if (hero && hero.type === 'fullscreen' && hero.url && hero.url.length) {
      return 'white'
    } else {
      return 'black'
    }
  }

  onChangeLayout = (type) => {
    this.props.onChange('type', type)
  }

  render () {
    const { isOpen, onClick, loginAction } = this.props

    // Toggle change header to see login action dispatched after 500ms
    return (
      <div className='edit-header--controls' onClick={() => loginAction()}>
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

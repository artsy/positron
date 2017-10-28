import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ModalCover from './ModalCover.jsx'
import LayoutControls from './LayoutControls.jsx'
import VideoControls from './VideoControls.jsx'

export default class HeaderControls extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    hero: PropTypes.object
  }

  state = {
    isLayoutOpen: false,
    isVideoOpen: false
  }

  toggleControls = (controlType) => {
    const { isLayoutOpen, isVideoOpen } = this.state

    switch (controlType) {
      case 'layout': {
        return this.setState({
          isLayoutOpen: !isLayoutOpen,
          isVideoOpen: false
        })
      }
      case 'video': {
        return this.setState({
          isVideoOpen: !isVideoOpen,
          isLayoutOpen: false
        })
      }
      case 'close-all': {
        return this.setState({
          isVideoOpen: false,
          isLayoutOpen: false
        })
      }
    }
  }

  render () {
    const { isLayoutOpen, isVideoOpen } = this.state

    return (
      <div className='edit-header__container'>
        <ModalCover
          isOpen={isLayoutOpen || isVideoOpen}
          onClick={() => this.toggleControls('close-all')}
        />

        <VideoControls {...this.props}
          isOpen={isVideoOpen}
          onClick={() => this.toggleControls('video')}
        />

        <LayoutControls {...this.props}
          isOpen={isLayoutOpen}
          onClick={() => this.toggleControls('layout')}
        />
      </div>
    )
  }
}

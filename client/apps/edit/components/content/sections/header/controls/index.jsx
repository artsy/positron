import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ModalCover from './ModalCover.jsx'
import LayoutControls from './LayoutControls.jsx'
import VideoControls from './VideoControls.jsx'

export class HeaderControls extends Component {
  static propTypes = {
    article: PropTypes.object,
    channel: PropTypes.object,
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
      case 'close': {
        return this.setState({
          isVideoOpen: false,
          isLayoutOpen: false
        })
      }
    }
  }

  render () {
    const { isLayoutOpen, isVideoOpen } = this.state
    const { article, channel, hero, onChange } = this.props
    const isModalOpen = isLayoutOpen || isVideoOpen
    const isBasicHero = hero.get('type') === 'basic'

    return (
      <div className='edit-header__container'>
        {isModalOpen &&
          <ModalCover
            onClick={() => this.toggleControls('close')}
          />
        }
        {isBasicHero &&
          <VideoControls
            article={article}
            channel={channel}
            isOpen={isVideoOpen}
            onClick={() => this.toggleControls('video')}
          />
        }
        <LayoutControls
          hero={article.heroSection.attributes}
          isOpen={isLayoutOpen}
          onChange={onChange}
          onClick={() => this.toggleControls('layout')}
        />
      </div>
    )
  }
}

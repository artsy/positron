import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { SectionVideo } from '../../video/index.jsx'

export default class VideoControls extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired
  }

  render () {
    const { article, channel, isOpen, onClick } = this.props

    return (
      <div className='edit-header--video'>
        <div
          onClick={onClick}
          className='edit-header--video-open'
        >
          Embed Video
        </div>
        <div>
          {isOpen &&
            <div
              className='edit-section-container'
              data-editing
              data-type='video'
            >
              <SectionVideo editing hidePreview
                article={article}
                section={article.heroSection}
                channel={channel}
              />
            </div>
          }
        </div>
      </div>
    )
  }
}

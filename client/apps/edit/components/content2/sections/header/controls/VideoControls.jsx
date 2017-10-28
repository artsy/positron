import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { SectionVideo } from '../../video/index.jsx'

export default class VideoControls extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    hero: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired
  }

  render () {
    const { article, hero, isOpen, onClick } = this.props
    const isBasicFeature = hero.type === 'basic'

    return (
      isBasicFeature &&

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
              <SectionVideo editing
                article={article}
                section={article.heroSection}
                channel={{ isArtsyChannel: () => false }}
                headerType={'basic-embed'}
              />
            </div>
          }
        </div>
      </div>
    )
  }
}

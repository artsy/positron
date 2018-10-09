import PropTypes from "prop-types"
import React, { Component } from "react"
import VideoSectionControls from "../../video/controls"

export class VideoControls extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onProgress: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
  }

  render() {
    const { article, isOpen, onChange, onClick, onProgress } = this.props

    return (
      <div className="edit-header--video">
        <div onClick={onClick} className="edit-header--video-open">
          Embed Video
        </div>
        <div>
          {isOpen && (
            <div
              className="edit-section-container"
              data-editing
              data-type="video"
            >
              <VideoSectionControls
                section={article.hero_section}
                onChange={onChange}
                onProgress={onProgress}
                isHero
              />
            </div>
          )}
        </div>
      </div>
    )
  }
}

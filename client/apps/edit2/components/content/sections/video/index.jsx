import PropTypes from 'prop-types'
import Paragraph from '../../../../../../components/rich_text/components/paragraph.coffee'
import React, { Component } from 'react'
import { Controls } from './controls.jsx'
import { Video, IconRemove } from '@artsy/reaction-force/dist/Components/Publishing'

export class SectionVideo extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    hidePreview: PropTypes.bool,
    isHero: PropTypes.bool,
    section: PropTypes.object.isRequired
  }

  state = {
    progress: null
  }

  onProgress = (progress) => {
    this.setState({progress})
  }

  renderUploadProgress () {
    if (this.state.progress) {
      return (
        <div className='upload-progress-container'>
          <div
            className='upload-progress'
            style={{width: (this.state.progress * 100) + '%'}}
          />
        </div>
      )
    }
  }

  renderSectionControls () {
    const {
      article,
      editing,
      hidePreview,
      isHero,
      section
    } = this.props

    if (editing) {
      const showSectionLayouts = !isHero && !hidePreview

      return (
        <Controls
          section={section}
          isHero={isHero}
          sectionLayouts={showSectionLayouts}
          articleLayout={article.layout}
          onProgress={this.onProgress}
        />
      )
    }
  }

  renderRemoveButton () {
    if (this.props.section.get('cover_image_url')) {
      return (
        <div
          className='edit-section__remove'
          onClick={() => this.props.section.set('cover_image_url', null)}>
          <IconRemove />
        </div>
      )
    }
  }

  renderVideoEmbed () {
    const { section, article, editing, hidePreview } = this.props
    const hasUrl = Boolean(section.get('url'))

    if (hidePreview) {
      return
    }

    if (hasUrl) {
      return (
        <Video
          layout={article.layout}
          section={section.attributes}
        >
          {editing && this.renderRemoveButton()}
          <Paragraph
            type='caption'
            placeholder='Video Caption (required)'
            html={section.get('caption')}
            onChange={(html) => section.set('caption', html)}
            stripLinebreaks
            layout={article.layout}
          />
        </Video>
      )
    } else {
      return (
        <div className='edit-section__placeholder'>
          Add a video above
        </div>
      )
    }
  }

  render () {
    const isEditing = this.props.editing ? ' is-editing' : ''

    return (
      <section
        className={'edit-section--video' + isEditing} >
        {this.renderSectionControls()}
        {this.renderVideoEmbed()}
        {this.renderUploadProgress()}
      </section>
    )
  }
}

import PropTypes from 'prop-types'
import Paragraph from '../../../../../../components/rich_text2/components/paragraph.coffee'
import React, { Component } from 'react'
import { Controls } from './controls.jsx'
import { Video, IconRemove } from '@artsy/reaction-force/dist/Components/Publishing'

export class SectionVideo extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    headerType: PropTypes.string,
    isHero: PropTypes.bool,
    section: PropTypes.object.isRequired
  }

  state = {
    progress: null
  }

  onClickOff = () => {
    if (!this.props.section.get('url')) {
      this.props.section.destroy()
    }
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
      channel,
      editing,
      headerType,
      isHero,
      section
    } = this.props

    if (editing) {
      const showSectionLayouts = !isHero && headerType !== 'basic-embed'

      return (
        <Controls
          article={article}
          section={section}
          channel={channel}
          isHero={isHero}
          sectionLayouts={showSectionLayouts}
          articleLayout={article.get('layout')}
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
    const { section, article, editing, headerType } = this.props
    const isBasicHeader = headerType === 'basic-embed'
    const hasUrl = Boolean(section.get('url'))

    if (isBasicHeader) {
      return
    }

    if (hasUrl) {
      return (
        <Video
          layout={article.get('layout')}
          section={section.attributes}
        >
          {editing && this.renderRemoveButton()}
          <Paragraph
            type='caption'
            placeholder='Video Caption (required)'
            html={section.get('caption')}
            onChange={(html) => section.set('caption', html)}
            stripLinebreaks
            layout={article.get('layout')}
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

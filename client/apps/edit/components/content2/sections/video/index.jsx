import React, { Component } from 'react'
import Controls from './controls.jsx'
import Paragraph from '../../../../../../components/rich_text2/components/paragraph.coffee'
import components from '@artsy/reaction-force/dist/components/publishing/index'
const Video = components.Video
const IconRemove = components.Icon.Remove

export default class SectionVideo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      progress: null
    }
  }

  onCaptionChange = (html) => {
    this.props.section.set('caption', html)
  }

  onClickOff = () => {
    if (!this.props.section.get('url')) {
      this.props.section.destroy()
    }
  }

  onProgress = (progress) => {
    this.setState({progress})
  }

  onRemoveImage = () => {
    if (this.props.section.get('cover_image_url')) {
      this.props.section.set('cover_image_url', null)
    }
  }

  renderUploadProgress () {
    if (this.state.progress) {
      return (
        <div className='upload-progress-container'>
          <div
            className='upload-progress'
            style={{width: (this.state.progress * 100) + '%'}}></div>
        </div>
      )
    }
  }

  renderSectionControls () {
    if (this.props.editing) {
      return (
        <Controls
          section={this.props.section}
          channel={this.props.channel}
          isHero={this.props.isHero}
          sectionLayouts={!this.props.isHero}
          articleLayout={this.props.article.get('layout')}
          onProgress={this.onProgress} />
      )
    }
  }

  renderRemoveButton() {
    if (this.props.section.get('cover_image_url')) {
      return (
        <div className='edit-section__remove' onClick={this.onRemoveImage}>
          <IconRemove />
        </div>
      )
    }
  }

  renderVideoEmbed () {
    const { section, article, editing } = this.props
    if (section.get('url') && section.get('url').length) {
      return (
        <Video
          layout={article.get('layout')}
          section={{
            caption: section.get('caption'),
            url: section.get('url'),
            cover_image_url: section.get('cover_image_url')
          }}>
          {editing && this.renderRemoveButton()}
          <Paragraph
            type='caption'
            placeholder='Video Caption (required)'
            html={section.get('caption')}
            onChange={this.onCaptionChange}
            stripLinebreaks={true}
            layout={article.get('layout')} />
        </Video>
      )
    } else {
      return <div className='edit-section__placeholder'>Add a video above</div>
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

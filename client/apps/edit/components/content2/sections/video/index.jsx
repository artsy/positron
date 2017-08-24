import React, { Component } from 'react'
import Controls from './controls.jsx'
import Paragraph from '../../../../../../components/rich_text2/components/paragraph.coffee'
import components from '@artsy/reaction-force/dist/components/publishing/index'
const Video = components.Video

export default class SectionVideo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      progress: null
    }
    this.onCaptionChange = this.onCaptionChange.bind(this)
    this.onClickOff = this.onClickOff.bind(this)
    this.onProgress = this.onProgress.bind(this)
  }

  onCaptionChange (html) {
    this.props.section.set('caption', html)
  }

  onClickOff () {
    if (!this.props.section.get('url')) {
      this.props.section.destroy()
    }
  }

  onProgress (progress) {
    this.setState({progress})
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

  renderVideoEmbed () {
    if (this.props.section.get('url')) {
      return (
        <Video
          layout={this.props.article.get('layout')}
          section={{
            caption: this.props.section.get('caption'),
            url: this.props.section.get('url'),
            cover_image_url: this.props.section.get('cover_image_url')
          }}>
          <Paragraph
            type='caption'
            placeholder='Video Caption'
            html={this.props.section.get('caption')}
            onChange={this.onCaptionChange}
            layout={this.props.article.get('layout')} />
        </Video>
      )
    } else {
      return <div className='edit-section--video__placeholder'>Add a video above</div>
    }
  }

  render () {
    const isEditing = this.props.editing ? ' is-editing' : ''
    return (
      <section
        onClick={this.props.setEditing}
        className={'edit-section--video' + isEditing} >
        {this.renderSectionControls()}
        {this.renderVideoEmbed()}
        {this.renderUploadProgress()}
      </section>
    )
  }
}

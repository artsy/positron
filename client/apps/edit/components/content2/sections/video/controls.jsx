import React, { Component } from 'react'
import FileInput from '../../../../../../components/file_input/index.jsx'
import SectionControls from '../../section_controls/index.coffee'

export default class VideoControls extends Component {
  constructor (props) {
    super(props)
    this.onCoverImageChange = this.onCoverImageChange.bind(this)
    this.onUrlChange = this.onUrlChange.bind(this)
  }

  componentDidMount () {
    if (!this.props.section.get('url').length) {
      this.refs.input.focus()
    }
  }

  onCoverImageChange (url) {
    this.props.section.set('cover_image_url', url)
  }

  onUrlChange () {
    this.props.section.set('url', this.refs.input.value)
  }

  render () {
    return (
      <SectionControls
        section={this.props.section}
        channel={this.props.channel}
        isHero={this.props.isHero}
        sectionLayouts={this.props.sectionLayouts}
        articleLayout={this.props.articleLayout}>
        <h2>Video</h2>
        <input
          className='bordered-input bordered-input-dark'
          onChange={this.onUrlChange}
          defaultValue={this.props.section.get('url')}
          placeholder='Paste a youtube or vimeo url (e.g. http://youtube.com/watch?v=id)'
          ref='input' />
        <FileInput
          onUpload={this.onCoverImageChange}
          onProgress={this.props.onProgress}
          hasImage={this.props.section.get('cover_image_url')}
          label='Cover Image' />
      </SectionControls>
    )
  }
}

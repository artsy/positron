import PropTypes from 'prop-types'
import React, { Component } from 'react'
import FileInput from 'client/components/file_input/index.jsx'
import SectionControls from '../../section_controls/index.jsx'
import { isWebUri } from 'valid-url'

export class Controls extends Component {
  static propTypes = {
    articleLayout: PropTypes.string,
    channel: PropTypes.object,
    isHero: PropTypes.bool,
    section: PropTypes.object,
    sectionLayouts: PropTypes.bool,
    onProgress: PropTypes.func
  }

  componentDidMount () {
    if (!this.props.section.get('url')) {
      this.refs.input.focus()
    }
  }

  onCoverImageChange = (url) => {
    if (isWebUri(url)) {
      this.props.section.set('cover_image_url', url)
    }
  }

  onUrlChange = () => {
    const url = this.refs.input.value

    if (isWebUri(url)) {
      this.props.section.set({url})
    }
  }

  render () {
    const {
      articleLayout,
      channel,
      isHero,
      section,
      sectionLayouts,
      onProgress
    } = this.props

    return (
      <SectionControls
        section={section}
        channel={channel}
        isHero={isHero}
        sectionLayouts={sectionLayouts}
        articleLayout={articleLayout}>

        <h2>Video</h2>
        <input
          className='bordered-input bordered-input-dark'
          onChange={this.onUrlChange}
          defaultValue={section.get('url')}
          placeholder='Paste a youtube or vimeo url (e.g. http://youtube.com/watch?v=id)'
          ref='input'
        />
        <FileInput
          onUpload={this.onCoverImageChange}
          onProgress={onProgress}
          hasImage={section.get('cover_image_url')}
          label='Cover Image'
        />
      </SectionControls>
    )
  }
}

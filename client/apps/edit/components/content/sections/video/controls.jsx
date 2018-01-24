import PropTypes from 'prop-types'
import React, { Component } from 'react'
import FileInput from 'client/components/file_input/index.jsx'
import SectionControls from '../../section_controls/index.jsx'
import { isEmpty } from 'underscore'
import { isWebUri } from 'valid-url'

export class Controls extends Component {
  static propTypes = {
    articleLayout: PropTypes.string,
    isHero: PropTypes.bool,
    section: PropTypes.object,
    sectionLayouts: PropTypes.bool,
    onChange: PropTypes.func,
    onProgress: PropTypes.func
  }

  componentDidMount () {
    if (!this.props.section.get('url')) {
      this.refs.input.focus()
    }
  }

  componentWillUnmount = () => {
    const { section } = this.props

    if (!section.get('url')) {
      section.destroy()
    }
  }

  onCoverImageChange = (url) => {
    const { onChange, section } = this.props
    const isValid = isEmpty(url) || isWebUri(url)

    if (isValid) {
      section.set('cover_image_url', url)
      onChange && onChange('cover_image_url', url)
    }
  }

  onVideoUrlChange = () => {
    const { onChange, section } = this.props
    const url = this.refs.input.value

    if (isEmpty(url)) {
      section.set({
        url: '',
        cover_image_url: ''
      })
    } else if (isWebUri(url)) {
      section.set({url})
    }
    onChange && onChange('url', url)
  }

  render () {
    const {
      articleLayout,
      isHero,
      section,
      sectionLayouts,
      onProgress
    } = this.props

    return (
      <SectionControls
        section={section}
        isHero={isHero}
        sectionLayouts={sectionLayouts}
        articleLayout={articleLayout}
      >
        <h2>Video</h2>
        <input
          className='bordered-input bordered-input-dark'
          onChange={this.onVideoUrlChange}
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

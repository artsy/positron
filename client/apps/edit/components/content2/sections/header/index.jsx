import React, { Component } from 'react'
import components from '@artsy/reaction-force/dist/components/publishing/index'
import Controls from './controls.jsx'
import FileInput from '/client/components/file_input/index.jsx'
import PlainText from '/client/components/rich_text2/components/plain_text.jsx'
import Paragraph from '/client/components/rich_text2/components/paragraph.coffee'

const Header = components.Header
const IconRemove = components.Icon.Remove

export default class SectionHeader extends Component {
  constructor (props) {
    super(props)

    this.state = {
      progress: null
    }
  }

  onChange = (key, value) => {
    this.props.article.set(key, value)
  }

  onChangeHero = (key, value) => {
    const heroSection = this.props.article.heroSection
    heroSection.set(key, value)
    this.onChange('hero_section', heroSection.attributes)
  }

  onChangeLeadParagraph = (html) => {
    this.onChange('lead_paragraph', html)
  }

  onUpload = (image, width, height) => {
    this.onChangeHero('url', image)
  }

  onProgress = (progress) => {
    this.setState({ progress })
  }

  onRemoveImage = () => {
    this.onChangeHero('url', '')
  }

  renderFeatureDeck(article) {
    if (article.get('layout') === 'feature') {
      return (
        <PlainText
          content={article.heroSection.get('deck')}
          onChange={this.onChangeHero}
          name='deck'
          placeholder='Deck (optional)' />
      )
    }
  }

  renderFileUpload(prompt) {
    return (
      <FileInput
        type='simple'
        onUpload={this.onUpload}
        prompt={prompt}
        onProgress={this.onProgress} />
    )
  }

  renderImage(article) {
    const isFullscreen = article.heroSection.get('type') === 'fullscreen'
    const hasUrl = article.heroSection.get('url')
    const prompt = isFullscreen ? 'Add Background' : 'Add Image or Video'

    if (article.get('layout') === 'feature') {
      if(!hasUrl) {
        return (
          <div className='edit-header__image-container'>
            {this.renderFileUpload(prompt)}
            {this.renderProgress()}
          </div>
        )
      } else if (isFullscreen && hasUrl) {
        return (
          <div className='edit-header__image-container has-image'>
            {this.renderFileUpload('Change Background')}
          </div>
        )
      } else {
        return (
          <div
            className='edit-header__remove'
            onClick={this.onRemoveImage}>
            <IconRemove />
          </div>
        )
      }
    }
  }

  renderProgress() {
    if (this.state.progress) {
      return (
        <div className='upload-progress-container'>
          <div
            className='upload-progress'
            style={{width: (this.state.progress * 100) + '%'}}>
          </div>
        </div>
      )
    }
  }

  renderLeadParagraph(article) {
    if (article.get('layout') === 'classic') {
      return (
        <Paragraph
          html={article.get('lead_paragraph')}
          onChange={this.onChangeLeadParagraph}
          placeholder='Lead Paragraph (optional)'
          type='lead_paragraph'
          linked={false}
          stripLinebreaks={true}
          layout={article.get('layout')} />
      )
    }
  }

  renderLayoutControls(article) {
    if (article.get('layout') === 'feature') {
      return (
        <Controls onChange={this.onChangeHero} />
      )
    }
  }

  render() {
    const { article } = this.props
    const headerClass = ' ' + article.heroSection.get('type') || ' text'
    return(
      <div className={'edit-header' + headerClass}>
        {this.renderLayoutControls(article)}
        <Header article={article.attributes}>
          <PlainText
            content={article.attributes.title}
            onChange={this.onChange}
            name='title'
            placeholder='Title' />
          {this.renderFeatureDeck(article)}
          {this.renderImage(article)}
          {this.renderLeadParagraph(article)}
        </Header>
      </div>
    )
  }
}

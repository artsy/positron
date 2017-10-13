import PropTypes from 'prop-types'
import React, { Component } from 'react'
import components from '@artsy/reaction-force/dist/Components/Publishing/index'
import Controls from './controls.jsx'
import FileInput from '/client/components/file_input/index.jsx'
import { PlainText } from '/client/components/rich_text2/components/plain_text.jsx'
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

  renderTitle (article) {
    return (
      <PlainText
        content={article.attributes.title}
        onChange={this.onChange}
        name='title'
        placeholder='Title' />
    )
  }

  renderFeatureDeck (article) {
    return (
      <PlainText
        content={article.heroSection.get('deck')}
        onChange={this.onChangeHero}
        name='deck'
        placeholder='Deck (optional)' />
    )
  }

  renderFileUpload (prompt) {
    return (
      <FileInput
        type='simple'
        onUpload={this.onUpload}
        prompt={prompt}
        video
        onProgress={this.onProgress} />
    )
  }

  renderImage (article) {
    const isFullscreen = article.heroSection.get('type') === 'fullscreen'
    const hasUrl = article.heroSection.get('url') && article.heroSection.get('url').length
    const prompt = isFullscreen ? 'Add Background' : 'Add Image or Video'

    if (isFullscreen && hasUrl) {
      return (
        <div className='edit-header__image-container has-image'>
          {this.renderFileUpload('Change Background')}
        </div>
      )
    } else if (hasUrl) {
      return (
        <div
          className='edit-header__remove'
          onClick={this.onRemoveImage}>
          <IconRemove />
        </div>
      )
    } else {
      return (
        <div className='edit-header__image-container' data-has-image={false}>
          {this.renderFileUpload(prompt)}
          {this.state.progress && this.renderProgress()}
        </div>
      )
    }
  }

  renderProgress () {
    return (
      <div className='upload-progress-container'>
        <div
          className='upload-progress'
          style={{width: (this.state.progress * 100) + '%'}} />
      </div>
    )
  }

  renderLeadParagraph (article) {
    return (
      <Paragraph
        html={article.get('lead_paragraph')}
        onChange={this.onChangeLeadParagraph}
        placeholder='Lead Paragraph (optional)'
        type='lead_paragraph'
        linked={false}
        stripLinebreaks
        layout={article.get('layout')} />
    )
  }

  render () {
    const { article } = this.props
    const isFeature = article.get('layout') === 'feature'
    const isClassic = article.get('layout') === 'classic'
    let headerClass = ''
    if (isFeature) {
      headerClass = ' ' + article.heroSection.get('type') || 'text'
    }
    if (isClassic) {
      return (
        <div className={'edit-header' + headerClass}>
          <Header article={article.attributes}>
            {this.renderTitle(article)}
            {this.renderLeadParagraph(article)}
          </Header>
        </div>
      )
    } else {
      return (
        <div className={'edit-header' + headerClass}>
          {isFeature && <Controls onChange={this.onChangeHero} hero={article.heroSection.attributes} />}
          <Header article={article.attributes}>
            <span>Missing Vertical</span>
            {this.renderTitle(article)}
            {isFeature && this.renderFeatureDeck(article)}
            {isFeature && this.renderImage(article)}
          </Header>
        </div>
      )
    }
  }
}

SectionHeader.propTypes = {
  article: PropTypes.object.isRequired
}

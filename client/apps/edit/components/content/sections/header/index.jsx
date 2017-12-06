import FileInput from '/client/components/file_input/index.jsx'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Header, IconRemove } from '@artsy/reaction-force/dist/Components/Publishing'
import { HeaderControls } from './controls/index.jsx'
import { PlainText } from '/client/components/rich_text/components/plain_text.jsx'

export class SectionHeader extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    onChange: PropTypes.func
  }

  state = {
    progress: null
  }

  onChangeHero = (key, value) => {
    const { article, onChange } = this.props
    article.heroSection.set(key, value)
    onChange('hero_section', article.heroSection.attributes)
  }

  onProgress = (progress) => {
    this.setState({ progress })
  }

  renderTitle (article) {
    return (
      <PlainText
        content={article.attributes.title}
        onChange={(key, value) => this.props.onChange('title', value)}
        placeholder='Title'
        name='title'
      />
    )
  }

  renderFileUpload (prompt) {
    return (
      <FileInput
        type='simple'
        onUpload={(src) => this.onChangeHero('url', src)}
        prompt={prompt}
        video
        onProgress={this.onProgress}
      />
    )
  }

  renderImage (heroSection) {
    const { type, url } = heroSection.attributes
    const isFullscreen = type && type === 'fullscreen'
    const hasUrl = url && url.length
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
          onClick={() => this.onChangeHero('url', '')}>
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

  render () {
    const { article, channel } = this.props
    const isFeature = article.get('layout') === 'feature'
    const isClassic = article.get('layout') === 'classic'

    if (isClassic) {
      return (
        <div className='edit-header'>
          <Header article={article.attributes} date={article.getPublishDate()}>
            {this.renderTitle(article)}

            <Paragraph
              html={article.get('lead_paragraph')}
              onChange={(input) => this.props.onChange('lead_paragraph', input)}
              placeholder='Lead Paragraph (optional)'
              type='lead_paragraph'
              linked={false}
              stripLinebreaks
              layout={article.get('layout')}
            />
          </Header>
        </div>
      )
    } else {
      const headerClass = isFeature ? (article.heroSection.get('type')) || 'text' : ''

      return (
        <div
          className={'edit-header ' + headerClass}
          data-type={isFeature && (article.heroSection.get('type') || 'text')}
        >
          {isFeature &&
            <HeaderControls
              onChange={this.onChangeHero}
              article={article}
              channel={channel}
              hero={article.heroSection}
            />
          }

          <Header article={article.attributes} date={article.getPublishDate()}>
            <span>Missing Vertical</span>
            {this.renderTitle(article)}
            {isFeature &&
              <PlainText
                content={article.heroSection.get('deck')}
                onChange={(content) => this.onChangeHero('deck', content)}
                placeholder='Deck (optional)'
              />
            }
            {isFeature && this.renderImage(article.heroSection)}
          </Header>
        </div>
      )
    }
  }
}

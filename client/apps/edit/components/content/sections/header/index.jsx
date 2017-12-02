import HeaderControls from './controls/index.jsx'
import FileInput from '/client/components/file_input/index.jsx'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Header, IconRemove } from '@artsy/reaction-force/dist/Components/Publishing'
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
    const heroSection = this.props.article.get('hero_section') || {}

    heroSection[key] = value
    this.props.onChange('hero_section', heroSection)
  }

  onProgress = (progress) => {
    this.setState({ progress })
  }

  renderTitle (article) {
    return (
      <PlainText
        content={article.attributes.title}
        onChange={(text) => this.props.onChange('title', text)}
        placeholder='Title'
      />
    )
  }

  renderFileUpload (prompt) {
    return (
      <FileInput
        type='simple'
        onUpload={(image) => this.onChangeHero('url', image)}
        prompt={prompt}
        video
        onProgress={this.onProgress}
      />
    )
  }

  renderImage (heroSection) {
    const { type, url } = heroSection
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
          <Header article={article.attributes}>
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
      const heroSection = article.get('hero_section') || { type: 'text' }
      const headerClass = ' ' + heroSection.type

      return (
        <div className={'edit-header ' + headerClass}>
          {isFeature &&
            <HeaderControls
              onChange={this.onChangeHero}
              article={article}
              channel={channel}
              hero={heroSection}
            />
          }

          <Header article={article.attributes}>
            <span>Missing Vertical</span>
            {this.renderTitle(article)}
            {isFeature &&
              <PlainText
                content={heroSection.deck}
                onChange={(content) => this.onChangeHero('deck', content)}
                placeholder='Deck (optional)'
              />
            }
            {isFeature && this.renderImage(heroSection)}
          </Header>
        </div>
      )
    }
  }
}

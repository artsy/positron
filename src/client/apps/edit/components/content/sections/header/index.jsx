import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Header } from '@artsy/reaction/dist/Components/Publishing'
import FileInput from '/client/components/file_input/index.jsx'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import HeaderControls from './controls/index.jsx'
import { PlainText } from '/client/components/rich_text/components/plain_text.jsx'
import { ProgressBar } from '/client/components/file_input/progress_bar.jsx'
import { RemoveButton } from 'client/components/remove_button'
import { onChangeArticle, onChangeHero } from 'client/actions/editActions'

export class SectionHeader extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    onChangeHeroAction: PropTypes.func
  }

  state = {
    progress: null
  }

  onProgress = (progress) => {
    this.setState({ progress })
  }

  renderTitle = () => {
    const { article, onChange } = this.props

    return (
      <PlainText
        content={article.title}
        onChange={(content) => onChange('title', content)}
        placeholder='Page Title'
      />
    )
  }

  renderFeatureDeck = (hero) => {
    const { onChangeHeroAction } = this.props

    return (
      <PlainText
        content={hero.deck}
        onChange={(content) => onChangeHeroAction('deck', content)}
        placeholder='Deck (optional)'
      />
    )
  }

  renderFileUpload (prompt) {
    const { onChangeHeroAction } = this.props

    return (
      <FileInput
        type='simple'
        onUpload={(src) => onChangeHeroAction('url', src)}
        prompt={prompt}
        video
        onProgress={this.onProgress}
      />
    )
  }

  renderImage (hero) {
    const { type, url } = hero
    const { onChangeHeroAction } = this.props
    const { progress } = this.state

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
        <RemoveButton
          onClick={() => onChangeHeroAction('url', '')}
        />
      )
    } else {
      return (
        <div className='edit-header__image-container' data-has-image={false}>
          {this.renderFileUpload(prompt)}

          {progress &&
            <ProgressBar progress={progress} cover />
          }
        </div>
      )
    }
  }

  getPublishDate = () => {
    const { article } = this.props
    let date = new Date()
    if (article.published) {
      date = article.published_at
    } else if (article.scheduled_publish_at) {
      date = article.scheduled_publish_at
    }
    return moment(date).local().toISOString()
  }

  renderLeadParagraph = () => {
    const { article, onChange } = this.props

    return (
      <Paragraph
        html={article.lead_paragraph}
        onChange={(input) => onChange('lead_paragraph', input)}
        placeholder='Lead Paragraph (optional)'
        type='lead_paragraph'
        linked={false}
        stripLinebreaks
        layout={article.layout}
      />
    )
  }

  render () {
    const { article } = this.props

    const isFeature = article.layout === 'feature'
    const isClassic = article.layout === 'classic'
    const hero = article.hero_section || {}

    if (isClassic) {
      return (
        <div className='edit-header'>
          <Header article={article} date={this.getPublishDate()}>
            {this.renderTitle()}
            {this.renderLeadParagraph()}
          </Header>
        </div>
      )
    } else {
      const headerType = isFeature ? (hero.type || 'text') : ''

      return (
        <div
          className={'edit-header ' + headerType}
          data-type={headerType}
        >
          {isFeature &&
            <HeaderControls onProgress={this.onProgress} />
          }

          <Header article={article} date={this.getPublishDate()}>
            <span>Missing Vertical</span>
            {this.renderTitle()}
            {isFeature && this.renderFeatureDeck(hero)}
            {isFeature && this.renderImage(hero)}
          </Header>
        </div>
      )
    }
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article
})

const mapDispatchToProps = {
  onChangeHeroAction: onChangeHero,
  onChange: onChangeArticle
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionHeader)

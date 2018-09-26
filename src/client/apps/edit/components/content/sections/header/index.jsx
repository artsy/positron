import styled from 'styled-components'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { space } from '@artsy/palette'
import { Header } from '@artsy/reaction/dist/Components/Publishing'
import { Text } from '@artsy/reaction/dist/Components/Publishing/Sections/Text'
import { Deck } from '@artsy/reaction/dist/Components/Publishing/Header/Layouts/Components/FeatureInnerContent'
import { FeatureHeaderContainer } from '@artsy/reaction/dist/Components/Publishing/Header/Layouts/Components/FeatureFullscreenHeader'
import { BasicHeaderContainer } from '@artsy/reaction/dist/Components/Publishing/Header/Layouts/Components/FeatureBasicHeader'
import { Paragraph } from 'client/components/draft/paragraph/paragraph'
import { PlainText } from 'client/components/draft/plain_text/plain_text'
import { ProgressBar } from 'client/components/file_input/progress_bar'
import { RemoveButton } from 'client/components/remove_button'
import { onChangeArticle } from 'client/actions/edit/articleActions'
import { onChangeHero } from 'client/actions/edit/sectionActions'
import FileInput from 'client/components/file_input'
import HeaderControls from './controls'

export class SectionHeader extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    onChangeHeroAction: PropTypes.func
  }

  state = {
    progress: null
  }

  onProgress = progress => {
    this.setState({ progress })
  }

  editTitle = () => {
    const { article, onChange } = this.props

    return (
      <PlainText
        content={article.title}
        onChange={content => onChange('title', content)}
        placeholder='Page Title'
      />
    )
  }

  editFeatureDeck = hero => {
    const { onChangeHeroAction } = this.props

    return (
      <PlainText
        content={hero.deck}
        onChange={content => onChangeHeroAction('deck', content)}
        placeholder='Deck (optional)'
      />
    )
  }

  renderFileUpload = prompt => {
    const { onChangeHeroAction } = this.props

    return (
      <FileInput
        type='simple'
        onUpload={src => onChangeHeroAction('url', src)}
        prompt={prompt}
        video
        onProgress={this.onProgress}
      />
    )
  }

  editImage = hero => {
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

  editLeadParagraph = () => {
    const { article, onChange } = this.props

    return (
      <LeadParagraph>
        <Text layout={article.layout}>
          <Paragraph
            html={article.lead_paragraph}
            onChange={(input) => onChange('lead_paragraph', input)}
            placeholder='Lead Paragraph (optional)'
            stripLinebreaks
          />
        </Text>
      </LeadParagraph>
    )
  }

  render() {
    const { article } = this.props
    const isFeature = article.layout === 'feature'
    const isClassic = article.layout === 'classic'
    const hero = article.hero_section || {}

    if (isClassic) {
      return (
        <div className='edit-header'>
          <Header
            article={article}
            date={this.getPublishDate()}
            editTitle={this.editTitle()}
            editLeadParagraph={this.editLeadParagraph()}
          />
        </div>
      )
    } else {
      const headerType = isFeature ? (hero.type || 'text') : ''
      const hasVertical = article.vertical ? undefined : 'Missing Vertical'
      const hasImageUrl = hero.url && hero.url.length
      const hasWhiteText = (headerType === 'fullscreen') && hasImageUrl

      return (
        <HeaderContainer
          className={'edit-header ' + headerType}
          data-type={headerType}
          hasVertical
          hasImageUrl={hasImageUrl}
        >
          {isFeature &&
            <HeaderControls onProgress={this.onProgress} />
          }

          <Header
            article={article}
            date={this.getPublishDate()}
            editDeck={isFeature ? this.editFeatureDeck(hero) : undefined}
            editImage={isFeature && headerType !== 'basic' ? this.editImage(hero) : undefined}
            editTitle={this.editTitle()}
            editVertical={hasVertical}
            textColor={hasWhiteText ? 'white' : 'black'}
          />
        </HeaderContainer>
      )
    }
  }
}

const mapStateToProps = state => ({
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

// TODO: Import from reaction after version bump
export const LeadParagraph = styled.div`
  padding-bottom: ${space(3)}px;
  max-width: 580px;
  margin: 0 auto;
  text-align: left;
`

const HeaderContainer = styled.div`
  ${Deck} {
    width: 100%;
  }
  ${FeatureHeaderContainer} {
    height: calc(100vh - 95px);
  }
  ${BasicHeaderContainer} {
    margin-top: 0;
  }
`

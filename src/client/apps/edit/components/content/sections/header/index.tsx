import { color, space } from "@artsy/palette"
import { Header } from "@artsy/reaction/dist/Components/Publishing"
import { LeadParagraph } from "@artsy/reaction/dist/Components/Publishing/Header/Layouts/ClassicHeader"
import { BasicHeaderContainer } from "@artsy/reaction/dist/Components/Publishing/Header/Layouts/Components/FeatureBasicHeader"
import { FeatureHeaderContainer } from "@artsy/reaction/dist/Components/Publishing/Header/Layouts/Components/FeatureFullscreenHeader"
import { Deck } from "@artsy/reaction/dist/Components/Publishing/Header/Layouts/Components/FeatureInnerContent"
import { FeatureTextAsset } from "@artsy/reaction/dist/Components/Publishing/Header/Layouts/Components/FeatureTextHeader"
import { EditImage } from "@artsy/reaction/dist/Components/Publishing/Header/Layouts/FeatureHeader"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { onChangeHero } from "client/actions/edit/sectionActions"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { PlainText } from "client/components/draft/plain_text/plain_text"
import FileInput from "client/components/file_input"
import { ProgressBar } from "client/components/file_input/progress_bar"
import {
  RemoveButton,
  RemoveButtonContainer,
} from "client/components/remove_button"
import moment from "moment"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import HeaderControls from "./controls"
import { LayoutControlsContainer } from "./controls/LayoutControls"

interface SectionHeaderProps {
  article: ArticleData
  onChangeArticleAction: (key: string, val: any) => void
  onChangeHeroAction: (key: string, val: any) => void
}

interface SectionHeaderState {
  progress: number | null
}

export class SectionHeader extends Component<
  SectionHeaderProps,
  SectionHeaderState
> {
  state = {
    progress: null,
  }

  onProgress = progress => {
    this.setState({ progress })
  }

  editTitle = () => {
    const { article, onChangeArticleAction } = this.props

    return (
      <Title>
        <PlainText
          content={article.title}
          onChange={content => onChangeArticleAction("title", content)}
          placeholder="Page Title"
        />
      </Title>
    )
  }

  editFeatureDeck = hero => {
    const { onChangeHeroAction } = this.props

    return (
      <PlainText
        content={hero.deck}
        onChange={content => onChangeHeroAction("deck", content)}
        placeholder="Deck (optional)"
      />
    )
  }

  renderFileUpload = (prompt: string) => {
    const { onChangeHeroAction } = this.props

    return (
      <FileInput
        type="simple"
        onUpload={src => onChangeHeroAction("url", src)}
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

    const isFullscreen = type && type === "fullscreen"
    const hasUrl = url && url.length
    const prompt = isFullscreen ? "Add Background" : "Add Image or Video"

    if (isFullscreen && hasUrl) {
      return (
        <ImageContainter hasImage={hasUrl} heroType={type}>
          {this.renderFileUpload("Change Background +")}
        </ImageContainter>
      )
    } else if (hasUrl) {
      return <RemoveButton onClick={() => onChangeHeroAction("url", "")} />
    } else {
      return (
        <ImageContainter
          className="edit-header__image-container"
          hasImage={hasUrl}
          heroType={type}
        >
          {this.renderFileUpload(prompt)}

          {progress && <ProgressBar progress={progress} cover />}
        </ImageContainter>
      )
    }
  }

  getPublishDate = () => {
    const { article } = this.props
    let date = new Date()
    if (article.published && article.published_at) {
      date = new Date(article.published_at)
    } else if (article.scheduled_publish_at) {
      date = article.scheduled_publish_at
    }
    return moment(date)
      .local()
      .toISOString()
  }

  editLeadParagraph = () => {
    const { article, onChangeArticleAction } = this.props

    return (
      <LeadParagraph>
        <Paragraph
          html={article.lead_paragraph}
          onChange={input => onChangeArticleAction("lead_paragraph", input)}
          placeholder="Lead Paragraph (optional)"
          stripLinebreaks
        />
      </LeadParagraph>
    )
  }

  render() {
    const { article } = this.props
    const isFeature = article.layout === "feature"
    const isClassic = article.layout === "classic"
    const hero = article.hero_section || {}

    if (isClassic) {
      return (
        <HeaderContainer className="edit-header" layout={article.layout}>
          <Header
            article={article}
            date={this.getPublishDate()}
            editTitle={this.editTitle()}
            editLeadParagraph={this.editLeadParagraph()}
          />
        </HeaderContainer>
      )
    } else {
      const heroType = isFeature ? hero.type || "text" : ""
      const verticalPlaceholder = article.vertical ? "" : "Missing Vertical"
      const hasImageUrl = hero.url && hero.url.length
      const hasWhiteText = heroType === "fullscreen" && hasImageUrl

      return (
        <HeaderContainer
          className="edit-header"
          layout={article.layout}
          heroType={heroType}
        >
          {isFeature && <HeaderControls onProgress={this.onProgress} />}

          <Header
            article={article}
            date={this.getPublishDate()}
            editDeck={isFeature ? this.editFeatureDeck(hero) : undefined}
            editImage={
              isFeature && heroType !== "basic"
                ? this.editImage(hero)
                : undefined
            }
            editTitle={this.editTitle()}
            editVertical={verticalPlaceholder as any} // TODO: Type editVertical as string
            textColor={hasWhiteText ? "white" : "black"}
          />
        </HeaderContainer>
      )
    }
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeHeroAction: onChangeHero,
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionHeader)

const HeaderContainer = styled.div<{ layout: string; heroType?: string }>`
  position: relative;

  a {
    background-image: none;
  }

  ${Deck} {
    width: 100%;
  }
  ${FeatureHeaderContainer} {
    height: calc(100vh - 90px);
  }
  ${BasicHeaderContainer} {
    margin-top: 0;
  }

  .upload-progress {
    min-width: 0;
  }

  ${RemoveButtonContainer} {
    width: ${space(3)}px;
    height: ${space(3)}px;
    position: absolute;
    top: -${space(1)}px;
    right: -${space(1)}px;
    z-index: 2;
  }

  ${props =>
    props.layout === "feature" &&
    `
    margin-bottom: ${space(3)}px;
  `};

  ${props =>
    (props.layout !== "feature" || props.heroType === "split") &&
    `
    padding-top: ${space(1)}px;
  `};

  ${LayoutControlsContainer} {
    ${props =>
      props.heroType === "split" &&
      `
      padding-top: 0;
      margin-top: -8px;
    `};
  }

  ${FeatureTextAsset} {
    min-height: 400px;
  }

  ${EditImage} {
    position: absolute;

    ${props =>
      props.heroType === "text" &&
      `
      left: 0;
      right: 5px;
      top: ${space(2)}px;
      bottom: 0;
    `};
  }
`

const Title = styled.div`
  .public-DraftEditorPlaceholder-inner:after {
    content: " *";
    color: ${color("red100")};
    position: absolute;
  }
`

const ImageContainter = styled.div<{ hasImage: boolean; heroType: string }>`
  top: ${space(2)}px;
  left: ${space(2)}px;
  right: ${space(2)}px;
  bottom: ${space(2)}px;

  .find-input.simple {
    height: 100%;
    max-height: 400px;
    min-height: 400px;
  }

  .file-input__upload-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  ${props =>
    props.heroType === "split" &&
    `
    height: 100%;

    .file-input.simple {
      max-height: 100%;
      min-height: 100%;
    }
  `};

  ${props =>
    props.heroType === "text" &&
    `

    .file-input.simple {
      min-height: 400px;
    }
  `};

  ${props =>
    props.heroType === "fullscreen" &&
    `
      padding-top: ${space(1)}px;
      padding-left: ${space(1)}px;

      .file-input.simple {
        height: inherit;
        min-height: 0;
        max-height: 100%;
        width: 235px;
        z-index: 1;
        padding: 0;

        .file-input__upload-container {
          background: none transparent;
        }
      }

      .file-input__upload-container {
        h1 {
          text-align: left;
        }
        h2 {
          display: none;
        }
      }
  `};

  ${props =>
    !props.hasImage &&
    props.heroType === "fullscreen" &&
    `
    .file-input__upload-container h1 {
      color: black;
    }
  `};
`

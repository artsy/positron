import { color } from "@artsy/palette"
import { Header } from "@artsy/reaction/dist/Components/Publishing"
import { LeadParagraph } from "@artsy/reaction/dist/Components/Publishing/Header/Layouts/ClassicHeader"
import { BasicHeaderContainer } from "@artsy/reaction/dist/Components/Publishing/Header/Layouts/Components/FeatureBasicHeader"
import { FeatureHeaderContainer } from "@artsy/reaction/dist/Components/Publishing/Header/Layouts/Components/FeatureFullscreenHeader"
import { Deck } from "@artsy/reaction/dist/Components/Publishing/Header/Layouts/Components/FeatureInnerContent"
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
        <div className="edit-header">
          <Header
            article={article}
            date={this.getPublishDate()}
            editTitle={this.editTitle()}
            editLeadParagraph={this.editLeadParagraph()}
          />
        </div>
      )
    } else {
      const headerType = isFeature ? hero.type || "text" : ""
      const verticalPlaceholder = article.vertical ? "" : "Missing Vertical"
      const hasImageUrl = hero.url && hero.url.length
      const hasWhiteText = headerType === "fullscreen" && hasImageUrl

      return (
        <HeaderContainer
          className={"edit-header " + headerType}
          layout={article.layout}
        >
          {isFeature && <HeaderControls onProgress={this.onProgress} />}

          <Header
            article={article}
            date={this.getPublishDate()}
            editDeck={isFeature ? this.editFeatureDeck(hero) : undefined}
            editImage={
              isFeature && headerType !== "basic"
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

const HeaderContainer = styled.div<{ layout: string }>`
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
    width: 30px;
    height: 30px;
    position: absolute;
    top: -10px;
    right: -10px;
    z-index: 10;
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
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;

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

    h1:after {
      content: " +";
      font-size: 1.5em;
    }
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
    props.heroType === "fullscreen" &&
    `
      padding-top: 10px;
      padding-left: 10px;

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

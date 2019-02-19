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
import { RemoveButton } from "client/components/remove_button"
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

  renderFileUpload = prompt => {
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
        <div className="edit-header__image-container has-image">
          {this.renderFileUpload("Change Background")}
        </div>
      )
    } else if (hasUrl) {
      return <RemoveButton onClick={() => onChangeHeroAction("url", "")} />
    } else {
      return (
        <div className="edit-header__image-container" data-has-image={false}>
          {this.renderFileUpload(prompt)}

          {progress && <ProgressBar progress={progress} cover />}
        </div>
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
          data-type={headerType}
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

const Title = styled.div`
  .public-DraftEditorPlaceholder-inner:after {
    content: " *";
    color: ${color("red100")};
    position: absolute;
  }
`

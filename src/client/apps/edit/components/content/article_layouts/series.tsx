import { Box, color } from "@artsy/palette"
import { SeriesContent } from "@artsy/reaction/dist/Components/Publishing/Layouts/SeriesLayout"
import { Text } from "@artsy/reaction/dist/Components/Publishing/Sections/Text"
import { FixedBackground } from "@artsy/reaction/dist/Components/Publishing/Series/FixedBackground"
import { SeriesAbout } from "@artsy/reaction/dist/Components/Publishing/Series/SeriesAbout"
import {
  SeriesTitle,
  SeriesTitleContainer,
} from "@artsy/reaction/dist/Components/Publishing/Series/SeriesTitle"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { PlainText } from "client/components/draft/plain_text/plain_text"
import FileInput from "client/components/file_input"
import {
  ProgressBar,
  ProgressContainer,
} from "client/components/file_input/progress_bar"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { RelatedArticles } from "../sections/related_articles"

interface EditSeriesProps {
  article: ArticleData
  onChangeArticleAction: (key: string, val: any) => void
}

export class EditSeries extends Component<EditSeriesProps> {
  state = {
    uploadProgress: null,
  }

  onChangeHero = url => {
    const { onChangeArticleAction } = this.props
    const hero_section = {
      url,
      type: "series",
    }

    onChangeArticleAction("hero_section", hero_section)
  }

  editTitle = () => {
    const { article, onChangeArticleAction } = this.props

    return (
      <PlainText
        content={article.title}
        onChange={(_key, value) => onChangeArticleAction("title", value)}
        placeholder="Title"
        name="title"
      />
    )
  }

  editSubTitle = () => {
    const { article, onChangeArticleAction } = this.props
    const sub_title = article.series && article.series.sub_title

    return (
      <Box color="white">
        <PlainText
          content={sub_title || ""}
          onChange={onChangeArticleAction}
          placeholder="About the Series"
          name="series.sub_title"
        />
      </Box>
    )
  }

  editDescription = () => {
    const { article, onChangeArticleAction } = this.props
    const description = article.series && article.series.description

    return (
      <Text layout={article.layout || "series"} color="white">
        <Paragraph
          html={description || ""}
          hasLinks
          isDark
          onChange={html => onChangeArticleAction("series.description", html)}
          placeholder="Start writing here..."
        />
      </Text>
    )
  }

  render() {
    const { article, onChangeArticleAction } = this.props
    const { uploadProgress } = this.state
    const { url } = article.hero_section || ""

    return (
      <EditSeriesContainer>
        {uploadProgress && <ProgressBar progress={uploadProgress} />}
        <FixedBackground backgroundColor="black" backgroundUrl={url} />

        <BackgroundInput>
          <FileInput
            type="simple"
            onUpload={src => this.onChangeHero(src)}
            prompt={`+ ${url ? "Change" : "Add"} Background`}
            onProgress={progress => this.setState({ uploadProgress: progress })}
          />
        </BackgroundInput>

        <SeriesContent>
          <SeriesTitle
            article={article}
            editTitle={this.editTitle()}
            color="white"
          />

          <RelatedArticles
            article={article}
            onChange={onChangeArticleAction}
            color="white"
          />

          <SeriesAbout
            article={article}
            editDescription={this.editDescription()}
            editSubTitle={this.editSubTitle()}
            color="white"
          />
        </SeriesContent>
      </EditSeriesContainer>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditSeries)

const EditSeriesContainer = styled.div`
  position: relative;
  padding: 100px 20px 200px;

  ${ProgressContainer} {
    position: fixed;
    top: 95px;
    left: 0;
    right: 0;
    z-index: 1;
  }

  ${SeriesTitleContainer} {
    .public-DraftEditorPlaceholder-root {
      position: absolute;
      left: 0;
      right: 0;
      color: ${color("black30")};
    }
    .public-DraftEditorPlaceholder-inner:after {
      content: " *";
      color: ${color("red100")};
      position: absolute;
    }
  }
`

const BackgroundInput = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  .file-input.simple .file-input__upload-container {
    height: inherit;
    min-height: 0;
    max-height: 100%;
    width: 235px;
    z-index: 1;
    padding: 0;
    background: none;
    text-align: right;
    h1 {
      font-size: 13px;
    }
    h2 {
      display: none;
    }
  }
`

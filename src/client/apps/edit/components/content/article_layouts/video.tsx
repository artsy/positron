import { Text } from "@artsy/reaction/dist/Components/Publishing/Sections/Text"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import {
  Credits,
  VideoAbout,
  VideoAboutContainer,
} from "@artsy/reaction/dist/Components/Publishing/Video/VideoAbout"
import {
  VideoCover,
  VideoCoverContainer,
} from "@artsy/reaction/dist/Components/Publishing/Video/VideoCover"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { PlainText } from "client/components/draft/plain_text/plain_text"
import FileInput from "client/components/file_input"
import {
  ProgressBar,
  ProgressContainer,
} from "client/components/file_input/progress_bar"
import { clone } from "lodash"
import PropTypes from "prop-types"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"

interface EditVideoProps {
  article: ArticleData
  onChangeArticleAction: (key: string, val: any) => void
}

export class EditVideo extends Component<EditVideoProps> {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChangeArticleAction: PropTypes.func.isRequired,
  }

  state = {
    uploadProgress: null,
  }

  onMediaChange = (key, value) => {
    const { article, onChangeArticleAction } = this.props
    const media = clone(article.media) || {}

    media[key] = value
    onChangeArticleAction("media", media)
  }

  editDescription = () => {
    const { article, onChangeArticleAction } = this.props

    return (
      <PlainText
        content={article.description}
        onChange={val => onChangeArticleAction("description", val)}
        placeholder="Description"
      />
    )
  }

  editTitle = () => {
    const { article, onChangeArticleAction } = this.props

    return (
      <PlainText
        content={article.title}
        onChange={val => onChangeArticleAction("title", val)}
        placeholder="Title"
      />
    )
  }

  editMediaDescription = () => {
    const { article } = this.props
    const description = article.media && article.media.description

    return (
      <Text layout={article.layout || "video"} color="white">
        <Paragraph
          html={description || ""}
          hasLinks
          onChange={html => this.onMediaChange("description", html)}
          placeholder="Start writing here..."
        />
      </Text>
    )
  }

  editMediaCredits = () => {
    const { article } = this.props
    const credits = article.media && article.media.credits

    return (
      <Text layout={article.layout || "video"} color="white">
        <Paragraph
          allowEmptyLines
          html={credits || ""}
          hasLinks
          onChange={html => this.onMediaChange("credits", html)}
          placeholder="Start writing here..."
        />
      </Text>
    )
  }

  render() {
    const { article } = this.props
    const { uploadProgress } = this.state
    const media = article.media || {}

    return (
      <EditVideoContainer>
        {uploadProgress && <ProgressBar progress={uploadProgress} />}

        <VideoCover
          article={article}
          editTitle={this.editTitle()}
          editDescription={this.editDescription()}
          media={media}
        />

        <EditCoverInput>
          <FileInput
            type="simple"
            onUpload={src => this.onMediaChange("cover_image_url", src)}
            prompt={`+ ${media.cover_image_url ? "Change" : "Add"} Cover Image`}
            onProgress={progress => this.setState({ uploadProgress: progress })}
          />
        </EditCoverInput>

        <EditVideoInput>
          <FileInput
            video
            type="simple"
            sizeLimit={100}
            onUpload={src => this.onMediaChange("url", src)}
            prompt={`+ ${media.url ? "Change" : "Add"} Video`}
            onProgress={progress => this.setState({ uploadProgress: progress })}
          />
        </EditVideoInput>

        <VideoAbout
          article={article}
          editDescription={this.editMediaDescription()}
          editCredits={this.editMediaCredits()}
          color="white"
        />
      </EditVideoContainer>
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
)(EditVideo)

const EditVideoInput = styled.div`
  top: 20px;
`
const EditCoverInput = styled.div`
  top: 50px;
`

export const EditVideoContainer = styled.div`
  position: relative;
  background-color: black;
  color: white;
  padding-bottom: 100px;

  ${ProgressContainer} {
    position: fixed;
    top: 95px;
    left: 0;
    right: 0;
    z-index: 1;
  }

  ${VideoCoverContainer}, ${VideoAboutContainer} {
    .public-DraftEditorPlaceholder-root {
      color: gray;
    }
  }

  ${Credits} {
    div[data-block="true"] .public-DraftStyleDefault-block {
      padding: 0;
    }
  }

  ${VideoCoverContainer} {
    width: 100%;
    margin-bottom: 40px;
    position: relative;
  }

  ${EditVideoInput}, ${EditCoverInput} {
    z-index: 10;
    position: absolute;
    right: 20px;

    .file-input.simple .file-input__upload-container {
      height: inherit;
      min-height: 0;
      max-height: 100%;
      width: 235px;
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
  }
`

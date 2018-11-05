import moment from "moment"
import styled from "styled-components"
import { clone } from "lodash"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import React, { Component } from "react"
import { Text } from "@artsy/reaction/dist/Components/Publishing/Sections/Text"
import {
  VideoAbout,
  VideoAboutContainer,
  Credits,
} from "@artsy/reaction/dist/Components/Publishing/Video/VideoAbout"
import {
  VideoCover,
  VideoCoverContainer,
} from "@artsy/reaction/dist/Components/Publishing/Video/VideoCover"
import FileInput from "client/components/file_input"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { PlainText } from "client/components/draft/plain_text/plain_text"
import { ProgressBar } from "client/components/file_input/progress_bar"
import { avantgarde } from "@artsy/reaction/dist/Assets/Fonts"
import { onChangeArticle } from "client/actions/edit/articleActions"

export class EditVideo extends Component {
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

  onDateChange = e => {
    const date = moment(e.target.value).toISOString()
    this.onMediaChange("release_date", date)
  }

  editDescription = () => {
    const { article, onChangeArticleAction } = this.props

    return (
      <PlainText
        content={article.description}
        onChange={(key, value) => onChangeArticleAction("description", value)}
        placeholder="Description"
        name="description"
      />
    )
  }

  editTitle = () => {
    const { article, onChangeArticleAction } = this.props

    return (
      <PlainText
        content={article.title}
        onChange={(key, value) => onChangeArticleAction("title", value)}
        placeholder="Title"
        name="title"
      />
    )
  }

  editMediaDescription = () => {
    const { article } = this.props
    const description = article.media && article.media.description

    return (
      <Text layout={article.layout}>
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
      <Text layout={article.layout}>
        <Paragraph
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
            onProgress={uploadProgress => this.setState({ uploadProgress })}
          />
        </EditCoverInput>

        <EditVideoInput>
          <FileInput
            video
            type="simple"
            sizeLimit={100}
            onUpload={src => this.onMediaChange("url", src)}
            prompt={`+ ${media.url ? "Change" : "Add"} Video`}
            onProgress={uploadProgress => this.setState({ uploadProgress })}
          />
        </EditVideoInput>

        <EditVideoPublished
          className="field-group--inline flat-checkbox"
          onClick={e => this.onMediaChange("published", !media.published)}
          name="media.published"
        >
          <input type="checkbox" checked={media.published} readOnly />
          <label>Video Published</label>
        </EditVideoPublished>

        <EditVideoReleaseDate>
          <label>Release Date</label>
          <input
            type="date"
            className="bordered-input bordered-input-dark"
            defaultValue={moment(media.release_date).format("YYYY-MM-DD")}
            onChange={this.onDateChange}
          />
        </EditVideoReleaseDate>

        <MaxWidthContainer>
          <VideoAbout
            article={article}
            editDescription={this.editMediaDescription()}
            editCredits={this.editMediaCredits()}
            color="white"
          />
        </MaxWidthContainer>
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

const MaxWidthContainer = styled.div`
  max-width: 1200px;
  margin: auto;
`
const EditVideoInput = styled.div`
  top: 20px;
`
const EditCoverInput = styled.div`
  top: 50px;
`
export const EditVideoPublished = styled.div`
  top: 80px;
`
const EditVideoReleaseDate = styled.div`
  top: 120px;
  label {
    display: block;
    text-align: right;
    ${avantgarde("s13")};
  }
`

export const EditVideoContainer = styled.div`
  position: relative;
  background-color: black;
  color: white;

  .ProgressBar {
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
    div[data-block=true] .public-DraftStyleDefault-block {
      padding: 0;
    }
  }

  ${VideoCoverContainer} {
    width: 100%;
    margin-bottom: 40px;
    position: relative;
  }
  ${EditVideoInput},
  ${EditCoverInput},
  ${EditVideoPublished},
  ${EditVideoReleaseDate} {
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

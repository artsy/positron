import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { VideoAbout, VideoAboutContainer } from '@artsy/reaction-force/dist/Components/Publishing/Video/VideoAbout'
import { VideoCover, VideoCoverContainer } from '@artsy/reaction-force/dist/Components/Publishing/Video/VideoCover'
import { VideoPlayer, VideoPlayerContainer } from '@artsy/reaction-force/dist/Components/Publishing/Video/Player/VideoPlayer'
import FileInput from '/client/components/file_input/index.jsx'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import { PlainText } from '/client/components/rich_text/components/plain_text'
import { ProgressBar } from '/client/components/file_input/progress_bar.jsx'
import { IconRemove } from '@artsy/reaction-force/dist/Components/Publishing/Icon/IconRemove'

export class EditVideo extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  state = {
    uploadProgress: null,
    showVideo: false
  }

  onMediaChange = (key, value) => {
    const { article, onChange } = this.props
    const media = article.get('media') || {}

    media[key] = value.length ? value : null
    onChange('media', media)
  }

  onVideoUpload = (src) => {
    this.onMediaChange('url', src)
  }

  setDuration = (e) => {
    this.onMediaChange('duration', e.target.duration)
  }

  toggleVideoPreview = (showVideo) => {
    this.setState({
      showVideo
    })
  }
  editDescription = () => {
    const { article, onChange } = this.props

    return (
      <PlainText
        content={article.get('description')}
        onChange={(key, value) => onChange('description', value)}
        placeholder='Description'
        name='description'
      />
    )
  }

  editTitle = () => {
    const { article, onChange } = this.props

    return (
      <PlainText
        content={article.get('title')}
        onChange={(key, value) => onChange('title', value)}
        placeholder='Title'
        name='title'
      />
    )
  }

  editMediaDescription = () => {
    const { article } = this.props
    const description = article.get('media') && article.get('media').description

    return (
      <Paragraph
        html={description || ''}
        linked
        onChange={(html) => this.onMediaChange('description', html)}
        placeholder='Start writing here...'
      />
    )
  }

  editMediaCredits = () => {
    const { article } = this.props
    const credits = article.get('media') && article.get('media').credits

    return (
      <Paragraph
        html={credits || ''}
        linked
        onChange={(html) => this.onMediaChange('credits', html)}
        placeholder='Start writing here...'
      />
    )
  }

  render () {
    const { article } = this.props
    const { uploadProgress } = this.state
    const media = article.get('media') || {}

    return (
      <EditVideoContainer>
        {uploadProgress &&
          <ProgressBar progress={uploadProgress} />
        }

        <VideoPreview visible={this.state.showVideo}>
          <VideoPlayer
            url={media.url}
            onLoadedMetadata={this.setDuration}
          />
          <div onClick={() => this.toggleVideoPreview(false)}>
            <IconRemove />
          </div>
        </VideoPreview>

        <VideoCover
          article={article}
          editTitle={this.editTitle()}
          editDescription={this.editDescription()}
          media={media}
          playVideo={() => this.toggleVideoPreview(true)}
          hideCover={this.state.showVideo}
        />

        <EditCoverInput>
          <FileInput
            type='simple'
            onUpload={(src) => this.onMediaChange('cover_image_url', src)}
            prompt={`+ ${media.cover_image_url ? 'Change' : 'Add'} Cover Image`}
            onProgress={(uploadProgress) => this.setState({ uploadProgress })}
          />
        </EditCoverInput>

        <EditVideoInput>
          <FileInput
            video
            type='simple'
            sizeLimit={50}
            onUpload={(src) => this.onMediaChange('url', src)}
            prompt={`+ ${media.url ? 'Change' : 'Add'} Video`}
            onProgress={(uploadProgress) => this.setState({ uploadProgress })}
          />
        </EditVideoInput>

        <MaxWidthContainer>
          <VideoAbout
            article={article}
            editDescription={this.editMediaDescription()}
            editCredits={this.editMediaCredits()}
            color='white'
          />
        </MaxWidthContainer>

      </EditVideoContainer>
    )
  }
}

const MaxWidthContainer = styled.div`
  max-width: 1200px;
  margin: auto;
`
const EditVideoInput = styled.div``
const EditCoverInput = styled.div``

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
      position: absolute;
      left: 0;
      right: 0;
      color: gray;
    }
  }
  ${VideoCoverContainer} {
    width: 100%;
    margin-bottom: 40px;
  }
  ${EditVideoInput}, ${EditCoverInput} {
    z-index: 10;
    position: absolute;
    top: 20px;
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
  ${EditCoverInput} {
    top: 50px;
  }
`

const VideoPreview = styled.div`
  position: absolute;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;

  svg.remove {
    width: 50px;
    height: 50px;
    position: absolute;
    top: 0;
  }
`

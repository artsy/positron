import moment from 'moment'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { VideoAbout, VideoAboutContainer } from '@artsy/reaction-force/dist/Components/Publishing/Video/VideoAbout'
import { VideoCover, VideoCoverContainer } from '@artsy/reaction-force/dist/Components/Publishing/Video/VideoCover'
import FileInput from '/client/components/file_input/index.jsx'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import { PlainText } from '/client/components/rich_text/components/plain_text'
import { ProgressBar } from '/client/components/file_input/progress_bar.jsx'
import { Fonts } from '@artsy/reaction-force/dist/Components/Publishing/Fonts'

export class EditVideo extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  state = {
    uploadProgress: null
  }

  onMediaChange = (key, value) => {
    const { article, onChange } = this.props
    const media = article.get('media') || {}

    media[key] = value
    onChange('media', media)
  }

  onDateChange = (e) => {
    const date = moment(e.target.value).toISOString()
    this.onMediaChange('release_date', date)
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

        <VideoCover
          article={article}
          editTitle={this.editTitle()}
          editDescription={this.editDescription()}
          media={media}
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
            sizeLimit={100}
            onUpload={(src) => this.onMediaChange('url', src)}
            prompt={`+ ${media.url ? 'Change' : 'Add'} Video`}
            onProgress={(uploadProgress) => this.setState({ uploadProgress })}
          />
        </EditVideoInput>

        <EditVideoPublished
          className='field-group--inline flat-checkbox'
          onClick={(e) => this.onMediaChange('published', !media.published)}
          name='media.published'
        >
          <input
            type='checkbox'
            checked={media.published}
            readOnly
          />
          <label>Video Published</label>
        </EditVideoPublished>

        <EditVideoReleaseDate>
          <label>Release Date</label>
          <input
            type='date'
            className='bordered-input bordered-input-dark'
            defaultValue={moment(media.release_date).format('YYYY-MM-DD')}
            onChange={this.onDateChange}
            />
        </EditVideoReleaseDate>

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
    ${Fonts.avantgarde('s13')}
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

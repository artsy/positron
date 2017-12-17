import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  VideoAbout,
  VideoCover
} from '@artsy/reaction-force/dist/Components/Publishing'
import FileInput from '/client/components/file_input/index.jsx'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import { PlainText } from '/client/components/rich_text/components/plain_text'
import { ProgressBar } from '/client/components/file_input/progress_bar.jsx'

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
    const media = article.media || {}

    return (
      <EditVideoContainer
        className='EditVideo'
      >
        {uploadProgress &&
          <ProgressBar progress={uploadProgress} />
        }
        <div className='EditVideo__video-input'>
          <FileInput
            video
            type='simple'
            sizeLimit={50}
            onUpload={(src) => this.onMediaChange('url', src)}
            prompt={`+ ${media.url ? 'Change' : 'Add'} Video`}
            onProgress={(uploadProgress) => this.setState({ uploadProgress })}
          />
        </div>
        <div className='EditVideo__cover-input'>
          <FileInput
            type='simple'
            onUpload={(src) => this.onMediaChange('cover_image_url', src)}
            prompt={`+ ${media.cover_image_url ? 'Change' : 'Add'} Cover Image`}
            onProgress={(uploadProgress) => this.setState({ uploadProgress })}
          />
        </div>

        <VideoCover
          article={article}
          editTitle={this.editTitle()}
          editDescription={this.editDescription()}
          media={media}
          // seriesTitle={}
        />

        <VideoAbout
          article={article}
          editDescription={this.editMediaDescription()}
          editCredits={this.editMediaCredits()}
          color='white'
        />

      </EditVideoContainer>
    )
  }
}

export const EditVideoContainer = styled.div`
  background-color: black;
  color: white;
  // ${props => props.url && `
  //   background-image: url(${props.url});
  //   background-size: cover;
  //   background-position: 50%;
  // `}
`

import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { SeriesAbout } from '@artsy/reaction-force/dist/Components/Publishing/Series/SeriesAbout'
import { SeriesTitle } from '@artsy/reaction-force/dist/Components/Publishing/Series/SeriesTitle'
import { SeriesContent } from '@artsy/reaction-force/dist/Components/Publishing/Series/Series'
import FileInput from '/client/components/file_input/index.jsx'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import { PlainText } from '/client/components/rich_text/components/plain_text'
import { RelatedArticles } from '../sections/related_articles/index'

export class EditSeries extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onChangeHero: PropTypes.func.isRequired
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

  editDescription = () => {
    const { article, onChange } = this.props

    return (
      <Paragraph
        html={article.get('series_description') || ''}
        linked
        onChange={(html) => onChange('series_description', html)}
        placeholder='Start writing here...'
      />
    )
  }

  render () {
    const { article, onChange, onChangeHero } = this.props
    const { url } = article.attributes.hero_section || {}

    return (
      <EditSeriesContainer
        className='EditSeries'
        url={url}
      >

        <div className='EditSeries__bg-input'>
          <FileInput
            type='simple'
            onUpload={(src) => onChangeHero('url', src)}
            prompt={`+ ${url ? 'Change' : 'Add'} Background`}
            onProgress={() => console.log('uploaded')}
          />
        </div>

        <SeriesContent>
          <SeriesTitle
            article={article}
            editTitle={this.editTitle()}
            color='white'
          />

          <RelatedArticles
            article={article}
            onChange={onChange}
            color='white'
          />

          <SeriesAbout
            article={article}
            editDescription={this.editDescription()}
            color='white'
          />
        </SeriesContent>

      </EditSeriesContainer>
    )
  }
}

export const EditSeriesContainer = styled.div`
  ${props => props.url && `
    background-image: url(${props.url});
    background-size: cover;
    background-position: 50%;
  `}
`

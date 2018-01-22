import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { FixedBackground } from '@artsy/reaction-force/dist/Components/Publishing/Series/FixedBackground'
import { SeriesAbout } from '@artsy/reaction-force/dist/Components/Publishing/Series/SeriesAbout'
import { SeriesTitle } from '@artsy/reaction-force/dist/Components/Publishing/Series/SeriesTitle'
import { SeriesContent } from '@artsy/reaction-force/dist/Components/Publishing/Layouts/SeriesLayout'
import FileInput from '/client/components/file_input/index.jsx'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import { PlainText } from '/client/components/rich_text/components/plain_text'
import { ProgressBar } from '/client/components/file_input/progress_bar.jsx'
import { RelatedArticles } from '../sections/related_articles/index'

export class EditSeries extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  state = {
    uploadProgress: null
  }

  onChangeHero = (url) => {
    const { onChange } = this.props
    const hero_section = {
      url,
      type: 'series'
    }

    onChange('hero_section', hero_section)
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
    const { article, onChange } = this.props
    const { uploadProgress } = this.state
    const { url } = article.attributes.hero_section || {}

    return (
      <div className='EditSeries'>
        {uploadProgress &&
          <ProgressBar progress={uploadProgress} />
        }
        <FixedBackground
          backgroundColor='black'
          backgroundUrl={url}
        />

        <div className='EditSeries__bg-input'>
          <FileInput
            type='simple'
            onUpload={(src) => this.onChangeHero(src)}
            prompt={`+ ${url ? 'Change' : 'Add'} Background`}
            onProgress={(uploadProgress) => this.setState({ uploadProgress })}
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

      </div>
    )
  }
}

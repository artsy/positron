import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { FixedBackground } from '@artsy/reaction/dist/Components/Publishing/Series/FixedBackground'
import { SeriesAbout } from '@artsy/reaction/dist/Components/Publishing/Series/SeriesAbout'
import { SeriesTitle } from '@artsy/reaction/dist/Components/Publishing/Series/SeriesTitle'
import { SeriesContent } from '@artsy/reaction/dist/Components/Publishing/Layouts/SeriesLayout'
import FileInput from '/client/components/file_input/index.jsx'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import { PlainText } from '/client/components/rich_text/components/plain_text'
import { ProgressBar } from '/client/components/file_input/progress_bar.jsx'
import { RelatedArticles } from '../sections/related_articles/index'
import { onChangeArticle } from 'client/actions/edit/articleActions'

export class EditSeries extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChangeArticleAction: PropTypes.func.isRequired
  }

  state = {
    uploadProgress: null
  }

  onChangeHero = (url) => {
    const { onChangeArticleAction } = this.props
    const hero_section = {
      url,
      type: 'series'
    }

    onChangeArticleAction({ hero_section })
  }

  editTitle = () => {
    const { article, onChangeArticleAction } = this.props

    return (
      <PlainText
        content={article.title}
        onChange={(key, value) => onChangeArticleAction('title', value)}
        placeholder='Title'
        name='title'
      />
    )
  }

  editSubTitle = () => {
    const { article, onChangeArticleAction } = this.props
    const sub_title = article.series && article.series.sub_title

    return (
      <PlainText
        content={sub_title || ''}
        onChange={onChangeArticleAction}
        placeholder='About the Series'
        name='series.sub_title'
      />
    )
  }

  editDescription = () => {
    const { article, onChangeArticleAction } = this.props
    const description = article.series && article.series.description

    return (
      <Paragraph
        html={description || ''}
        linked
        onChange={(html) => onChangeArticleAction('series.description', html)}
        placeholder='Start writing here...'
      />
    )
  }

  render () {
    const { article, onChangeArticleAction } = this.props
    const { uploadProgress } = this.state
    const { url } = article.hero_section || {}

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
            onChange={onChangeArticleAction}
            color='white'
          />

          <SeriesAbout
            article={article}
            editDescription={this.editDescription()}
            editSubTitle={this.editSubTitle()}
            color='white'
          />
        </SeriesContent>

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditSeries)

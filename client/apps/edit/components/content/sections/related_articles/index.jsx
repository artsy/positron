import async from 'async'
import request from 'superagent'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { compact, pluck, without } from 'underscore'
import { data as sd } from 'sharify'
import { EditArticleCard } from './components/edit_article_card'
import { RelatedArticlesInput } from './components/related_articles_input'
import { ArticleCard } from '@artsy/reaction-force/dist/Components/Publishing/Series/ArticleCard'
import DraggableList from '../../../../../../components/drag_drop/index.coffee'

export class RelatedArticles extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    color: PropTypes.string,
    onChange: PropTypes.func
  }

  state = {
    relatedArticles: [],
    loading: true
  }

  componentWillMount = () => {
    this.fetchArticles()
  }

  fetchArticles = () => {
    const { related_article_ids } = this.props.article.attributes
    let relatedArticles = []

    if (related_article_ids && related_article_ids.length) {
      return async.each(related_article_ids, (id, cb) => {
        return request
          .get(`${sd.API_URL}/articles/${id}`)
          .set({'X-Access-Token': (sd.USER != null ? sd.USER.access_token : undefined)})
          .end((err, res) => {
            if (err) {
              console.log(err)
            }
            relatedArticles.push(res.body)
            cb()
          })
      }
      , () => {
        this.setState({
          loading: false,
          relatedArticles: compact(relatedArticles)
        })
      })
    } else {
      this.setState({
        loading: false,
        relatedArticles
      })
    }
  }

  onAddArticle = (related_article_ids) => {
    const { onChange } = this.props

    onChange('related_article_ids', related_article_ids)
    this.fetchArticles()
  }

  onRemoveArticle = (id) => {
    const { article, onChange } = this.props
    const { related_article_ids } = article.attributes
    const newRelated = without(related_article_ids, id)

    onChange('related_article_ids', newRelated)
    this.fetchArticles()
  }

  onDragEnd = (relatedArticles) => {
    const { onChange } = this.props
    const newRelated = pluck(relatedArticles, '_id')

    this.setState({ relatedArticles })
    onChange('related_article_ids', newRelated)
  }

  renderRelatedArticles = () => {
    const { article, color } = this.props
    const { relatedArticles } = this.state

    return (
      <DraggableList
        items={relatedArticles}
        onDragEnd={this.onDragEnd}
        layout='vertical'
        isDraggable
      >
      {relatedArticles.map((relatedArticle, i) =>
        <EditArticleCard
          key={i}
          article={relatedArticle}
          series={article.attributes}
          onRemoveArticle={this.onRemoveArticle}
          color={color}
        />
      )}
      </DraggableList>
    )
  }

  renderRelatedPreview = () => {
    const { article, color } = this.props

    return (
      <div className='RelatedArticles__preview'>
        <ArticleCard
          editTitle='Title'
          editDescription='Article of video description...'
          editImage={() => <div />}
          editDate='Publish Date'
          article={{}}
          series={article.attributes}
          color={color}
        />
      </div>
    )
  }

  render () {
    const { relatedArticles, loading } = this.state
    const { article, color } = this.props

    return (
      <div className='RelatedArticles'>

        <div className='RelatedArticles__list'>
          {loading
            ? <div className='loading-spinner' />

            : relatedArticles.length
              ? this.renderRelatedArticles()
              : this.renderRelatedPreview()
          }
        </div>

        <RelatedArticlesInput
          article={article}
          color={color}
          onChange={this.onAddArticle}
        />

      </div>
    )
  }
}

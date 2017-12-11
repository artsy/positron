import async from 'async'
import request from 'superagent'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { compact, without } from 'lodash'
import { data as sd } from 'sharify'
import { EditArticleCard } from './components/edit_article_card'
import { RelatedArticlesInput } from './components/related_articles_input'
import { ArticleCard } from '@artsy/reaction-force/dist/Components/Publishing/Series/ArticleCard'

export class RelatedArticles extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
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

    if (related_article_ids && related_article_ids.length) {
      let relatedArticles = []

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
        relatedArticles: []
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

  renderRelatedArticles = () => {
    const { article } = this.props
    const { relatedArticles } = this.state

    return (
      <div>
        {relatedArticles.map((relatedArticle, i) =>
          <EditArticleCard
            key={i}
            article={relatedArticle}
            series={article.attributes}
            onRemoveArticle={this.onRemoveArticle}
          />
        )}
      </div>
    )
  }

  render () {
    const { article } = this.props
    const { relatedArticles, loading } = this.state

    return (
      <div className='RelatedArticles'>

        <div className='RelatedArticles__list'>
          {loading
            ? <div className='loading-spinner' />

            : relatedArticles.length
              ? this.renderRelatedArticles()

              : <ArticleCard
                  editTitle='Title'
                  editDescription='Article of video description...'
                  editImage={() => <div>Img</div>}
                  article={{}}
                  series={article.attributes}
                />
          }
        </div>

        <RelatedArticlesInput
          article={article}
          onChange={this.onAddArticle}
        />

      </div>
    )
  }
}

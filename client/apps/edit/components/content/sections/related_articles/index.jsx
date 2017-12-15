import request from 'superagent'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { difference, flatten, pluck, uniq, without } from 'underscore'
import { data as sd } from 'sharify'
import { ArticleCard } from '@artsy/reaction-force/dist/Components/Publishing/Series/ArticleCard'
import { RelatedArticleQuery } from 'client/queries/related_articles'
import { EditArticleCard } from './components/edit_article_card'
import { RelatedArticlesInput } from './components/related_articles_input'
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
    const { relatedArticles } = this.state
    const alreadyFetched = pluck(relatedArticles, 'id')
    const idsToFetch = difference(related_article_ids, alreadyFetched)

    if (idsToFetch.length) {
      request
        .get(`${sd.API_URL}/graphql`)
        .set({
          'Accept': 'application/json',
          'X-Access-Token': (sd.USER && sd.USER.access_token)
        })
        .query({ query: RelatedArticleQuery(idsToFetch) })
        .end((err, res) => {
          if (err) {
            console.error(err)
          }
          relatedArticles.push(res.body.data.articles)
          this.setState({
            loading: false,
            relatedArticles: uniq(flatten(relatedArticles))
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

  onRemoveArticle = (id, index) => {
    const { article, onChange } = this.props
    const { relatedArticles } = this.state
    const { related_article_ids } = article.attributes
    const newRelatedIds = without(related_article_ids, id)

    relatedArticles.splice(index, 1)
    onChange('related_article_ids', newRelatedIds)
    this.setState({ relatedArticles })
  }

  onDragEnd = (relatedArticles) => {
    const { onChange } = this.props
    const newRelatedIds = pluck(relatedArticles, 'id')

    this.setState({ relatedArticles })
    onChange('related_article_ids', newRelatedIds)
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
          onRemoveArticle={(id) => this.onRemoveArticle(id, i)}
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

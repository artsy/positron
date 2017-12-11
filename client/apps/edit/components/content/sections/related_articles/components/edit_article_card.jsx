import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { IconRemove } from '@artsy/reaction-force/dist/Components/Publishing'
import { ArticleCard } from '@artsy/reaction-force/dist/Components/Publishing/Series/ArticleCard'

export class EditArticleCard extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    series: PropTypes.object,
    onRemoveArticle: PropTypes.func
  }

  render () {
    const { article, series, onRemoveArticle } = this.props

    return (
      <div className='EditArticleCard'>
          <a
            className='EditArticleCard__edit'
            href={`/articles/${article._id}/edit`}
            target='_blank'
          >
            Edit Article
          </a>

        <div
          className='EditArticleCard__remove'
          onClick={() => onRemoveArticle(article._id)}
        >
          <IconRemove />
        </div>

        <ArticleCard
          article={article}
          series={series}
        />

      </div>
    )
  }
}

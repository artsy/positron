import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { IconRemove } from '@artsy/reaction-force/dist/Components/Publishing'
import { ArticleCard } from '@artsy/reaction-force/dist/Components/Publishing/Series/ArticleCard'

export class EditArticleCard extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    color: PropTypes.string,
    series: PropTypes.object,
    onRemoveArticle: PropTypes.func
  }

  render () {
    const { article, color, series, onRemoveArticle } = this.props

    return (
      <div className='EditArticleCard'>
          <EditLink
            className='EditArticleCard__edit'
            href={`/articles/${article.id}/edit`}
            target='_blank'
            color={color}
          >
            Edit Article
          </EditLink>

        <div
          className='EditArticleCard__remove'
          onClick={() => onRemoveArticle(article.id)}
        >
          <IconRemove
            background={color && color}
            color={color === 'white' ? 'black' : 'white'}
          />
        </div>

        <ArticleCard
          article={article}
          series={series}
          color={color}
        />

      </div>
    )
  }
}

const EditLink = styled.a`
  color: ${props => props.color || 'black'};
`

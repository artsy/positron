import PropTypes from 'prop-types'
import React, { Component } from 'react'
import EditArticle from './article_layouts/article'
import { EditSeries } from './article_layouts/series'
import { EditVideo } from './article_layouts/video'

export class EditContent extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onChangeHero: PropTypes.func.isRequired
  }

  getArticleLayout = () => {
    const { article } = this.props

    switch (article.get('layout')) {
      case 'series': {
        return <EditSeries {...this.props} />
      }
      case 'video': {
        return <EditVideo {...this.props} />
      }
      default: {
        return <EditArticle {...this.props} />
      }
    }
  }

  render () {
    const { article } = this.props

    return (
      <div
        className={'EditContent'}
        data-layout={article.get('layout')}
      >
        {this.getArticleLayout()}
      </div>
    )
  }
}

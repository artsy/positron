import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { RelatedArticleInput } from './components/related_article_input'

export class RelatedArticles extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChange: PropTypes.func
  }

  render () {
    return (
      <div className='RelatedArticles'>
        RelatedArticles
        <RelatedArticleInput {...this.props} />
      </div>
    )
  }
}

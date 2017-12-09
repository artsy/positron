import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { data as sd } from 'sharify'
import { Autocomplete } from '/client/components/autocomplete/index.jsx'

export class RelatedArticleInput extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func
  }

  onAddArticle = (related_article_ids) => {
    const { onChange } = this.props
    // fetch all related
    onChange('related_article_ids', related_article_ids)
  }

  render () {
    const { article, label } = this.props
    const related = article.get('related_article_ids') || []

    return (
      <div className='RelatedArticleInput'>

        <label>{label || 'Add an article'}</label>

        <Autocomplete
          items={related}
          onChange={this.onAddArticle}
          placeholder='Search by article title...'
          url={`${sd.API_URL}/articles?published=true&q=%QUERY`}
        />

      </div>
    )
  }
}

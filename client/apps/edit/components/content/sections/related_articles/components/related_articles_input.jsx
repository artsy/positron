import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { data as sd } from 'sharify'
import { Autocomplete } from '/client/components/autocomplete/index.jsx'

export class RelatedArticlesInput extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChange: PropTypes.func
  }

  render () {
    const { article, onChange } = this.props
    const related = article.get('related_article_ids') || []

    return (
      <div className='RelatedArticlesInput'>

        <label>Add an article</label>

        <Autocomplete
          items={related}
          onSelect={onChange}
          placeholder='Search by title...'
          url={`${sd.API_URL}/articles?published=true&q=%QUERY`}
        />

      </div>
    )
  }
}

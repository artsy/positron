import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { data as sd } from 'sharify'
import { Autocomplete } from '/client/components/autocomplete2/index'

export class RelatedArticlesInput extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    color: PropTypes.string,
    onChange: PropTypes.func
  }

  render () {
    const { article, color, onChange } = this.props
    const related = article.get('related_article_ids') || []

    return (
      <RelatedArticlesInputContainer
        className='RelatedArticlesInput'
        color={color}
      >

        <label>Add an article</label>

        <Autocomplete
          items={related}
          onSelect={onChange}
          placeholder='Search by title...'
          url={`${sd.API_URL}/articles?published=true&q=%QUERY`}
        />

      </RelatedArticlesInputContainer>
    )
  }
}

const RelatedArticlesInputContainer = styled.div`
  color: ${props => props.color || 'black'};
  input,
  .Autocomplete__icon {
    color: ${props => props.color || 'black'};
  }
`

import PropTypes from 'prop-types'
import React, { Component } from 'react'

export class EditArticleCard extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChange: PropTypes.func
  }

  render () {
    const { article } = this.props

    return (
      <div className='EditArticleCard'>
        EditArticleCard {article.get('title')}
      </div>
    )
  }
}

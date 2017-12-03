import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { SectionFooter } from './sections/footer/index.jsx'
import { SectionHeader } from './sections/header/index.jsx'

export class EditContent extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    savedStatus: PropTypes.func,
    saveArticle: PropTypes.func
  }

  onChange = (key, value) => {
    const { article, savedStatus, saveArticle } = this.props
    article.set(key, value)

    if (article.get('published')) {
      savedStatus(false)
    } else {
      saveArticle(article)
    }
  }

  render () {
    const { article, channel } = this.props

    return (
      <div
        className={'EditContent ' + article.get('layout')}
        data-layout={article.get('layout')}
      >

        <SectionHeader
          article={article}
          channel={channel}
          onChange={this.onChange}
        />

        <SectionFooter
          article={article}
          channel={channel}
          onChange={this.onChange}
        />

      </div>
    )
  }
}

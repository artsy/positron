import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { SectionHeader } from './sections/header/index.jsx'

export class EditContent extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    savedStatus: PropTypes.func,
    save: PropTypes.func
  }

  onChange = (key, value) => {
    const { article, savedStatus, save } = this.props
    article.set(key, value)

    if (article.get('published')) {
      savedStatus(false)
    } else {
      save(article)
    }
  }

  render () {
    const { article, channel } = this.props

    return (
      <div
        className={'EditContent edit-section-layout ' + article.get('layout')}
        data-layout={article.get('layout')}
      >

        <SectionHeader
          article={article}
          channel={channel}
          onChange={this.onChange}
        />

      </div>
    )
  }
}

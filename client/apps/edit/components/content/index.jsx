import PropTypes from 'prop-types'
import React, { Component } from 'react'
import SectionList from './section_list/index.coffee'
import { SectionFooter } from './sections/footer/index'
import { SectionHeader } from './sections/header/index'

export class EditContent extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  render () {
    const { article, channel, onChange } = this.props

    return (
      <div
        className={'EditContent ' + article.get('layout')}
        data-layout={article.get('layout')}
      >

        <SectionHeader
          article={article}
          channel={channel}
          onChange={onChange}
        />

        <SectionList
          article={article}
          channel={channel}
          sections={article.sections}
        />

        <SectionFooter
          article={article}
          channel={channel}
          onChange={onChange}
        />

      </div>
    )
  }
}

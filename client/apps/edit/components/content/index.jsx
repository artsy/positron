import PropTypes from 'prop-types'
import React, { Component } from 'react'
import SectionList from './section_list/index.coffee'
import { SectionFooter } from './sections/footer/index'
import { SectionHeader } from './sections/header/index'
import { SectionHero } from './sections/hero/index'

export class EditContent extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onChangeHero: PropTypes.func.isRequired
  }

  render () {
    const { article, channel, onChange, onChangeHero } = this.props

    return (
      <div
        className={'EditContent ' + article.get('layout')}
        data-layout={article.get('layout')}
      >

        {channel.hasFeature('hero') &&
          <SectionHero
            article={article}
            channel={channel}
            onChange={onChange}
          />
        }

        <SectionHeader
          article={article}
          channel={channel}
          onChange={onChange}
          onChangeHero={onChangeHero}
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

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import SectionList from '../section_list/index.coffee'
import { SectionFooter } from '../sections/footer/index'
import { SectionHeader } from '../sections/header/index'
import { SectionHero } from '../sections/hero/index'

export class EditArticle extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onChangeHero: PropTypes.func.isRequired
  }

  render () {
    const { article, channel, onChange } = this.props

    return (
      <div className='EditArticle'>

        {channel.hasFeature('hero') &&
          <SectionHero
            article={article}
            channel={channel}
            onChange={onChange}
          />
        }

        <SectionHeader {...this.props} />

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

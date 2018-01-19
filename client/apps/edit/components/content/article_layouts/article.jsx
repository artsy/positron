import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import SectionFooter from '../sections/footer/index'
import { SectionHeader } from '../sections/header/index'
import { SectionHero } from '../sections/hero/index'
import SectionList from '../section_list/index'

export class EditArticle extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    lastUpdated: PropTypes.any,
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
            onChange={onChange}
          />
        }

        <SectionHeader {...this.props} />

        <SectionList
          article={article}
          sections={article.sections}
        />

        <SectionFooter
          article={article}
          onChange={onChange}
        />

      </div>
    )
  }
}
const mapStateToProps = (state) => ({
  channel: state.app.channel,
  lastUpdated: state.edit.lastUpdated
})

export default connect(
  mapStateToProps
)(EditArticle)

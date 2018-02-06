import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import SectionFooter from '../sections/footer'
import SectionHeader from '../sections/header'
import SectionHero from '../sections/hero'
import SectionList from '../section_list'

export class EditArticle extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  render () {
    const { article, channel, onChange } = this.props
    const hasHero = channel.type === 'support' || channel.type === 'team'

    return (
      <div className='EditArticle'>

        {hasHero &&
          <SectionHero />
        }

        <SectionHeader />

        <SectionList />

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

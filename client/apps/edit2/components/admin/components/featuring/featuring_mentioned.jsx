import PropTypes from 'prop-types'
import React, { Component } from 'react'
import FeaturingInput from './featuring_input'
import FeaturingList from './featuring_list'
import MentionedList from './mentioned_list'

export class FeaturingMentioned extends Component {
  static propTypes = {
    model: PropTypes.string
  }

  render () {
    const { model } = this.props

    return (
      <div className='FeaturingMentioned'>
        <label>
          {`${model}s`}
        </label>

        <FeaturingInput model={model} />
        <FeaturingList model={model} />
        <MentionedList model={model} />
      </div>
    )
  }
}

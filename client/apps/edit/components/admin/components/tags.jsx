import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { clean } from 'underscore.string'
import { uniq } from 'lodash'
import { Col, Row } from 'react-styled-flexboxgrid'

export class AdminTags extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChange: PropTypes.func
  }

  onChange = (key, value) => {
    const { onChange } = this.props

    let tagsArray = value.split(',').map((tag) => clean(tag))
    tagsArray = tagsArray.filter(Boolean)
    onChange(key, uniq(tagsArray))
  }

  render () {
    const { article } = this.props
    const topicTags = article.get('tags') || []
    const trackingTags = article.get('tracking_tags') || []

    return (
      <Row className='AdminTags'>

        <Col xs={6} className='field-group tags'>
          <label>Topic Tags</label>
          <input
            className='bordered-input'
            defaultValue={topicTags.join(', ')}
            onChange={(e) => this.onChange('tags', e.target.value)}
            placeholder='Start typing a topic tag...'
          />
        </Col>

        <Col xs={6} className='field-group tracking-tags'>
          <label>Tracking Tags</label>
          <input
            className='bordered-input'
            defaultValue={trackingTags.join(', ')}
            onChange={(e) => this.onChange('tracking_tags', e.target.value)}
            placeholder='Start typing a tracking tag...'
          />
        </Col>

      </Row>
    )
  }
}

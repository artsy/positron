import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { clean } from 'underscore.string'
import { connect } from 'react-redux'
import { uniq } from 'lodash'
import { Col, Row } from 'react-styled-flexboxgrid'
import { onChangeArticle } from 'client/actions/editActions'

export class AdminTags extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChangeArticleAction: PropTypes.func
  }

  onChange = (key, value) => {
    const { onChangeArticleAction } = this.props

    let tagsArray = value.split(',').map((tag) => clean(tag))
    tagsArray = tagsArray.filter(Boolean)
    onChangeArticleAction(key, uniq(tagsArray))
  }

  render () {
    const { article } = this.props
    const topicTags = article.tags || []
    const trackingTags = article.tracking_tags || []

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

const mapStateToProps = (state) => ({
  article: state.edit.article
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminTags)

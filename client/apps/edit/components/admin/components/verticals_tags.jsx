// import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'

export class AdminVerticalsTags extends Component {
  // static propTypes = {
  //   article: PropTypes.object,
  //   onChange: PropTypes.func
  // }

  // onChange = (key, value) => {
  //   const { article, onChange } = this.props
  //   const sponsor = article.get('sponsor') || {}

  //   sponsor[key] = value
  //   onChange('sponsor', sponsor)
  // }

  render () {
    // const { article } = this.props

    return (
      <Row className='AdminVerticalsTags'>
        <Col xs={6} className='field-group'>
          <label>AdminVerticalsTags</label>
        </Col>
        <Col xs={6} className='field-group'>
          <label>AdminVerticalsTags</label>
        </Col>
      </Row>
    )
  }
}

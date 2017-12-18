import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImageUpload from './image_upload.coffee'
import { Col, Row } from 'react-styled-flexboxgrid'

export class AdminSponsor extends Component {
  static propTypes = {
    article: PropTypes.object,
    channel: PropTypes.object,
    onChange: PropTypes.func
  }
  onChange = (key, value) => {
    const { article, onChange } = this.props
    const sponsor = article.sponsor || {}
    sponsor[key] = value
    onChange('sponsor', sponsor)
  }

  render () {
    const { article } = this.props
    const sponsor = article.get('sponsor') || {}

    return (
      <Row className='AdminSponsor'>
        <Col sm={6}>
          <label>Partner Logo Light</label>
          <ImageUpload
            onChange={this.onChange}
            src={sponsor.partner_light_logo}
            name='partner_light_logo'
          />
        </Col>
        <Col sm={6}>
          <label>Partner Logo Dark</label>
          <ImageUpload
            onChange={this.onChange}
            src={sponsor.partner_dark_logo}
            name='partner_dark_logo'
          />
        </Col>
        <Col sm={6}>
          <label>Partner Link</label>
          <input
            className='bordered-input'
            onChange={(e) => this.onChange('partner_logo_link', e.target.value)}
            placeholder='http://example.com...'
          />
        </Col>
      </Row>
    )
  }
}

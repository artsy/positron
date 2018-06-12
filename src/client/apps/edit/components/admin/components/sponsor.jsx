import { clone } from 'lodash'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImageUpload from './image_upload.coffee'
import { Col, Row } from 'react-styled-flexboxgrid'
import { onChangeArticle } from 'client/actions/edit/articleActions'

export class AdminSponsor extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChangeArticleAction: PropTypes.func
  }

  onChange = (key, value) => {
    const { article, onChangeArticleAction } = this.props
    const sponsor = clone(article.sponsor) || {}

    sponsor[key] = value
    onChangeArticleAction('sponsor', sponsor)
  }

  render () {
    const { article } = this.props
    const sponsor = article.sponsor || {}

    return (
      <Row className='AdminSponsor'>

        <Col xs={4} className='field-group'>
          <label>Partner Logo Light</label>
          <ImageUpload
            onChange={this.onChange}
            src={sponsor.partner_light_logo}
            name='partner_light_logo'
          />
        </Col>

        <Col xs={4} className='field-group'>
          <label>Partner Logo Dark</label>
          <ImageUpload
            onChange={this.onChange}
            src={sponsor.partner_dark_logo}
            name='partner_dark_logo'
          />
        </Col>

        <Col xs={4} className='field-group'>
          <label>Partner Logo Condensed</label>
          <ImageUpload
            onChange={this.onChange}
            src={sponsor.partner_condensed_logo}
            name='partner_condensed_logo'
          />
        </Col>

        <Col xs={6} className='field-group'>
          <label>Partner Link</label>
          <input
            className='bordered-input'
            defaultValue={sponsor.partner_logo_link}
            onChange={(e) => this.onChange('partner_logo_link', e.target.value)}
            placeholder='http://example.com...'
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
)(AdminSponsor)

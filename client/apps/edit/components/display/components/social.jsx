import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Col, Row } from 'react-styled-flexboxgrid'
import { onChangeArticle } from 'client/actions/editActions'
import { CharacterLimit } from 'client/components/character_limit'
import { SocialPreview } from './preview/social_preview'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'

export class DisplaySocial extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChangeArticleAction: PropTypes.func
  }

  render () {
    const { article, onChangeArticleAction } = this.props
    const {
      social_description,
      social_image,
      social_title
    } = article

    return (
      <Row className='DisplaySocial'>

        <Col lg={4}>
          <div className='field-group'>
            <label>Social Image</label>
            <ImageUpload
              name='social_image'
              src={social_image || ''}
              onChange={(key, value) => onChangeArticleAction(key, value)}
            />
          </div>

          <div className='field-group'>
            <CharacterLimit
              label='Social Headline'
              limit={97}
              type='textarea'
              onChange={(value) => onChangeArticleAction('social_title', value)}
              defaultValue={social_title}
            />
          </div>

          <div className='field-group'>
            <CharacterLimit
              label='Social Description'
              limit={160}
              type='textarea'
              onChange={(value) => onChangeArticleAction('social_description', value)}
              defaultValue={social_description}
            />
          </div>
        </Col>

        <Col lg={8}>
          <SocialPreview article={article} />
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
)(DisplaySocial)

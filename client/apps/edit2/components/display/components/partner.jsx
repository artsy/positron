import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Col } from 'react-styled-flexboxgrid'
import { onChangeArticle } from 'client/actions/editActions'
import { CharacterLimit } from 'client/components/character_limit'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'

export class DisplayPartner extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChangeArticleAction: PropTypes.func
  }

  render () {
    const { article, onChangeArticleAction } = this.props

    return (
      <div className='DisplayPartner admin-form-container'>
        <div className='DisplayPartner__preview'>
          <div className='max-width-container'>
            <div className='header'>
              <h1>Prepare your article for Artsy and social media</h1>
              <h2>Choose a thumbnail image and title that captures the user&rsquo;s attention</h2>
            </div>
            <img src='/images/edit_prepare_example.png' />
          </div>
        </div>

        <div className='DisplayPartner__edit max-width-container'>
          <Col xs={4}>
            <div className='field-group'>
              <label>Thumbnail Image</label>
              <ImageUpload
                name='thumbnail_image'
                src={article.thumbnail_image || ''}
                onChange={(key, value) => onChangeArticleAction(key, value)}
              />
            </div>
          </Col>

          <Col xs={8}>
            <div className='field-group'>
              <CharacterLimit
                label='Title'
                limit={97}
                type='textarea'
                onChange={(value) => onChangeArticleAction('thumbnail_title', value)}
                defaultValue={article.thumbnail_title || ''}
              />
              <div
                className='title-fill'
                onClick={(value) => onChangeArticleAction('thumbnail_title', article.title)}
              >
                Use Article Title
              </div>
            </div>
          </Col>
        </div>
      </div>
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
)(DisplayPartner)

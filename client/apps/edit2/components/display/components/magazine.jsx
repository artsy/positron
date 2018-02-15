import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Col, Row } from 'react-styled-flexboxgrid'
import { onChangeArticle } from 'client/actions/editActions'
import { MagazinePreview } from './preview/magazine_preview'
import { CharacterLimit } from 'client/components/character_limit'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'

export class DisplayMagazine extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChangeArticleAction: PropTypes.func
  }

  render () {
    const { article, onChangeArticleAction } = this.props

    return (
      <Row className='DisplayMagazine'>

        <Col xs={4}>
          <div className='field-group'>
            <label>Magazine Image</label>
            <ImageUpload
              name='thumbnail_image'
              src={article.thumbnail_image || ''}
              onChange={(key, value) => onChangeArticleAction(key, value)}
            />
          </div>

          <div className='field-group'>
            <CharacterLimit
              label='Magazine Headline'
              limit={97}
              type='textarea'
              onChange={(value) => onChangeArticleAction('thumbnail_title', value)}
              defaultValue={article.thumbnail_title}
            />
            <div
              className='title-fill'
              onClick={(value) => onChangeArticleAction('thumbnail_title', article.title)}
            >
              Use Article Title
            </div>
          </div>

          <div className='field-group'>
            <CharacterLimit
              label='Magazine Description'
              limit={160}
              type='textarea'
              onChange={(value) => onChangeArticleAction('description', value)}
              defaultValue={article.description}
            />
          </div>
        </Col>

        <Col xs={8}>
          <MagazinePreview article={article} />
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
)(DisplayMagazine)

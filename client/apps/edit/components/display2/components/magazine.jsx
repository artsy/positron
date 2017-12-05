import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { MagazinePreview } from './preview/magazine_preview'
import { CharacterLimit } from 'client/components/character_limit'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'

export const DisplayMagazine = (props) => {
  const { article, onChange } = props

  return (
    <Row className='DisplayMagazine'>

      <Col xs={4}>
        <div className='field-group'>
          <label>Magazine Image</label>
          <ImageUpload
            name='thumbnail_image'
            src={article.get('thumbnail_image') || ''}
            onChange={(key, value) => onChange(key, value)}
          />
        </div>

        <div className='field-group'>
          <CharacterLimit
            label='Magazine Headline'
            limit={97}
            type='textarea'
            onChange={(value) => onChange('thumbnail_title', value)}
            defaultValue={article.get('thumbnail_title')}
          />
          <div
            className='title-fill'
            onClick={(value) => onChange('thumbnail_title', article.get('title'))}
          >
            Use Article Title
          </div>
        </div>

        <div className='field-group'>
          <CharacterLimit
            label='Magazine Description'
            limit={160}
            type='textarea'
            onChange={(value) => onChange('description', value)}
            defaultValue={article.get('description')}
          />
        </div>
      </Col>

      <Col xs={8}>
        <MagazinePreview article={article} />
      </Col>
    </Row>
  )
}

DisplayMagazine.propTypes = {
  article: PropTypes.object,
  onChange: PropTypes.func
}

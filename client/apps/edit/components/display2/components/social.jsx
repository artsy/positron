import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { SocialPreview } from './preview/social_preview'
import { CharacterLimit } from 'client/components/character_limit'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'

export const DisplaySocial = (props) => {
  const { article, onChange } = props

  return (
    <Row className='DisplaySocial'>

      <Col lg={4}>
        <div className='field-group'>
          <label>Social Image</label>
          <ImageUpload
            name='social_image'
            src={article.get('social_image') || ''}
            onChange={(key, value) => onChange(key, value)}
          />
        </div>

        <div className='field-group'>
          <CharacterLimit
            label='Social Headline'
            limit={97}
            type='textarea'
            onChange={(value) => onChange('social_title', value)}
            defaultValue={article.get('social_title')}
          />
        </div>

        <div className='field-group'>
          <CharacterLimit
            label='Social Description'
            limit={160}
            type='textarea'
            onChange={(value) => onChange('social_description', value)}
            defaultValue={article.get('social_description')}
          />
        </div>
      </Col>

      <Col lg={8}>
        <SocialPreview article={article} />
      </Col>
    </Row>
  )
}

DisplaySocial.propTypes = {
  article: PropTypes.object,
  onChange: PropTypes.func
}

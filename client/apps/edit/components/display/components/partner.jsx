import PropTypes from 'prop-types'
import React from 'react'
import { Col } from 'react-styled-flexboxgrid'
import { CharacterLimit } from 'client/components/character_limit'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'

export const DisplayPartner = (props) => {
  const { article, onChange } = props

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
              src={article.get('thumbnail_image') || ''}
              onChange={(key, value) => onChange(key, value)}
            />
          </div>
        </Col>

        <Col xs={8}>
          <div className='field-group'>
            <CharacterLimit
              label='Title'
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
        </Col>
      </div>
    </div>
  )
}

DisplayPartner.propTypes = {
  article: PropTypes.object,
  onChange: PropTypes.func
}

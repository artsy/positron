import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'
import Paragraph from 'client/components/rich_text2/components/paragraph.coffee'

export const SeriesAdmin = (props) => {
  const { curation, onChange } = props

  return (
    <div className='admin-form-container series'>
      <Row>
        <Col lg={8}>
          <div className='field-group'>
            <label>About the Series</label>
            <div className='bordered-input'>
              <Paragraph
                html={curation.get('about') || ''}
                linked
                onChange={(html) => onChange('about', html)} />
            </div>
          </div>
        </Col>

        <Col lg={4}>
          <div className='field-group'>
            <label>Partner Logo: Header</label>
            <ImageUpload
              name='partner_logo_primary'
              src={curation.get('partner_logo_primary') || ''}
              onChange={(key, value) => onChange(key, value)} />
          </div>

          <div className='field-group'>
            <label>Partner Logo: Footer</label>
            <ImageUpload
              name='partner_logo_secondary'
              src={curation.get('partner_logo_secondary') || ''}
              onChange={(key, value) => onChange(key, value)} />
          </div>

          <div className='field-group'>
            <label>Partner Link Url</label>
            <input
              className='bordered-input'
              placeholder='http://example.com'
              defaultValue={curation.get('partner_link_url') || ''}
              onChange={(e) => onChange('partner_link_url', e.target.value)}
            />
          </div>
        </Col>
      </Row>
      <Row between='xs'>
        <Col lg={7}>
          <div className='field-group'>
            <label>Social Title</label>
            <input
              className='bordered-input'
              defaultValue={curation.get('social_title') || ''}
              onChange={(e) => onChange('social_title', e.target.value)}
            />
          </div>
          <div className='field-group'>
            <label>Social Description</label>
            <textarea
              className='bordered-input'
              defaultValue={curation.get('social_description') || ''}
              onChange={(e) => onChange('social_description', e.target.value)}
            />
          </div>
          <div className='field-group'>
            <label>Email Title</label>
            <input
              className='bordered-input'
              defaultValue={curation.get('email_title') || ''}
              onChange={(e) => onChange('email_title', e.target.value)}
            />
          </div>
          <div className='field-group'>
            <label>Email Author</label>
            <input
              className='bordered-input'
              defaultValue={curation.get('email_author') || ''}
              onChange={(e) => onChange('email_author', e.target.value)}
            />
          </div>
          <div className='field-group'>
            <label>Email Tags</label>
            <input
              className='bordered-input'
              defaultValue={curation.get('email_tags') || ''}
              onChange={(e) => onChange('email_tags', e.target.value)}
            />
          </div>
          <div className='field-group'>
            <label>Keywords</label>
            <input
              className='bordered-input'
              defaultValue={curation.get('keywords') || ''}
              onChange={(e) => onChange('keywords', e.target.value)}
            />
          </div>
        </Col>
        <Col lg={4}>
          <div className='field-group'>
            <label>Thumbnail Image</label>
            <ImageUpload
              name='thumbnail_image'
              src={curation.get('thumbnail_image') || ''}
              onChange={(key, value) => onChange(key, value)} />
          </div>
          <div className='field-group'>
            <label>Social Image</label>
            <ImageUpload
              name='social_image'
              src={curation.get('social_image') || ''}
              onChange={(key, value) => onChange(key, value)} />
          </div>
          <div className='field-group'>
            <label>Email Image</label>
            <ImageUpload
              name='email_image'
              src={curation.get('email_image') || ''}
              onChange={(key, value) => onChange(key, value)} />
          </div>
        </Col>
      </Row>
    </div>
  )
}

SeriesAdmin.propTypes = {
  curation: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

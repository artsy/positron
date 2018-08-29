import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Paragraph } from 'client/components/draft/paragraph/paragraph'
import { Metadata } from 'client/apps/settings/client/curations/gucci/components/metadata'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'

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
                hasLinks
                html={curation.get('about') || ''}
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
      <Metadata
        section={curation.toJSON()}
        onChange={(key, value) => onChange(key, value)}
      />
    </div>
  )
}

SeriesAdmin.propTypes = {
  curation: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

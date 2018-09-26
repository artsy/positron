import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Paragraph } from 'client/components/draft/paragraph/paragraph'
import { Metadata } from 'client/apps/settings/client/curations/gucci/components/metadata'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'

export const SectionAdmin = props => {
  const { section, onChange } = props

  return (
    <div className='admin-form-container section'>
      <Row>
        <Col lg={8}>
          <div className='field-group'>
            <label>Featuring</label>
            <input
              className='bordered-input'
              placeholder='Start typing...'
              defaultValue={section.featuring || ''}
              onChange={(e) => onChange('featuring', e.target.value)}
            />
          </div>

          <div className='field-group'>
            <label>About the Film</label>
            <div className='bordered-input'>
              <Paragraph
                hasLinks
                html={section.about || ''}
                onChange={(html) => onChange('about', html)} />
            </div>
          </div>

          <label>Release Date</label>
          <div className='field-group--inline'>
            <div className='field-group'>
              <input
                className='bordered-input'
                type='date'
                defaultValue={section.release_date && moment(section.release_date).format('YYYY-MM-DD')}
                onChange={(e) => onChange('release_date', moment(e.target.value).toISOString())}
              />
            </div>

            <div
              className='field-group flat-checkbox'
              onClick={() => onChange('published', !section.published)}>
              <input
                readOnly
                type='checkbox'
                checked={section.published}
              />
              <label>Published</label>
            </div>
          </div>
        </Col>

        <Col lg={4}>
          <div className='field-group'>
            <label>Video Embed Url</label>
            <input
              className='bordered-input'
              placeholder='http://youtube.com/xxx'
              defaultValue={section.video_url || ''}
              onChange={(e) => onChange('video_url', e.target.value)}
            />
          </div>
          <div className='field-group'>
            <label>Video Cover Image</label>
            <ImageUpload
              name='cover_image_url'
              src={section.cover_image_url || ''}
              onChange={(key, value) => onChange(key, value)} />
          </div>
        </Col>
      </Row>
      <Metadata
        section={section}
        onChange={(key, value) => onChange(key, value)}
      />
    </div>
  )
}

SectionAdmin.propTypes = {
  section: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

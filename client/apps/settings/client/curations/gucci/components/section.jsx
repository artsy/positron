import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'
import Paragraph from 'client/components/rich_text2/components/paragraph.coffee'

export const SectionAdmin = (props) => {
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
                linked
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
      <Row between='xs'>
        <Col lg={7}>
          <div className='field-group'>
            <label>Social Title</label>
            <input
              className='bordered-input'
              defaultValue={section.social_title || ''}
              onChange={(e) => onChange('social_title', e.target.value)}
            />
          </div>
          <div className='field-group'>
            <label>Social Description</label>
            <textarea
              className='bordered-input'
              defaultValue={section.social_description || ''}
              onChange={(e) => onChange('social_description', e.target.value)}
            />
          </div>
          <div className='field-group'>
            <label>Email Title</label>
            <input
              className='bordered-input'
              defaultValue={section.email_title || ''}
              onChange={(e) => onChange('email_title', e.target.value)}
            />
          </div>
          <div className='field-group'>
            <label>Email Author</label>
            <input
              className='bordered-input'
              defaultValue={section.email_author || ''}
              onChange={(e) => onChange('email_author', e.target.value)}
            />
          </div>
          <div className='field-group'>
            <label>Email Tags</label>
            <input
              className='bordered-input'
              defaultValue={section.email_tags || ''}
              onChange={(e) => onChange('email_tags', e.target.value)}
            />
          </div>
          <div className='field-group'>
            <label>Keywords</label>
            <input
              className='bordered-input'
              defaultValue={section.keywords || ''}
              onChange={(e) => onChange('keywords', e.target.value)}
            />
          </div>
        </Col>
        <Col lg={4}>
          <div className='field-group'>
            <label>Thumbnail Image</label>
            <ImageUpload
              name='thumbnail_image'
              src={section.thumbnail_image || ''}
              onChange={(key, value) => onChange(key, value)} />
          </div>
          <div className='field-group'>
            <label>Social Image</label>
            <ImageUpload
              name='social_image'
              src={section.social_image || ''}
              onChange={(key, value) => onChange(key, value)} />
          </div>
          <div className='field-group'>
            <label>Email Image</label>
            <ImageUpload
              name='email_image'
              src={section.email_image || ''}
              onChange={(key, value) => onChange(key, value)} />
          </div>
        </Col>
      </Row>
    </div>
  )
}

SectionAdmin.propTypes = {
  section: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

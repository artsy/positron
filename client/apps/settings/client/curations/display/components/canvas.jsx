import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'

import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'
import CharacterLimitInput from 'client/components/character_limit/index.jsx'

const Canvas = (props) => {
  const {campaign, index, onChange} = props
  return (
    <div className='display-admin__section--campaign'>
      <Row key={index} className='inputs--text'>
        <Col lg>
          <div className='field-group'>
            {campaign.canvas.layout === 'overlay'
              ? <CharacterLimitInput
                  type='textarea'
                  label='Body'
                  placeholder='Body'
                  defaultValue={campaign.canvas ? campaign.canvas.body : ''}
                  onChange={(html) => onChange('canvas.body', html, index)}
                  html
                  limit={90} />
              : <CharacterLimitInput
                  label='headline'
                  placeholder='Headline'
                  defaultValue={campaign.canvas ? campaign.canvas.headline : ''}
                  onChange={(e) => onChange('canvas.headline', e.target.value, index)}
                  limit={25} />
              }
          </div>
          <div className='field-group'>
            <CharacterLimitInput
              label='CTA Text'
              placeholder='Find Out More'
              defaultValue={campaign.canvas && campaign.canvas.link ? campaign.canvas.link.text : ''}
              onChange={(e) => onChange('canvas.link.text', e.target.value, index)}
              limit={25} />
          </div>
          <div className='field-group'>
            <label>CTA Link</label>
            <input
              className='bordered-input'
              placeholder='Find Out More'
              defaultValue={campaign.canvas && campaign.canvas.link ? campaign.canvas.link.url : ''}
              onChange={(e) => onChange('canvas.link.url', e.target.value, index)} />
          </div>
          <div className='field-group'>
            <CharacterLimitInput
              type='textarea'
              label='Disclaimer (optional)'
              placeholder='Enter legal disclaimer here'
              defaultValue={campaign.canvas ? campaign.canvas.body : ''}
              onChange={(e) => onChange('canvas.body', e.target.value, index)}
              limit={90} />
          </div>
        </Col>
        <Col lg>
          <Row key={index} className='inputs--images'>
            <Col lg>
              <label>Image</label>
              <ImageUpload
                name='canvas.assets'
                hasVideo
                src={campaign.canvas.assets[0] ? campaign.canvas.assets[0].url : ''}
                onChange={(name, url) => onImageInputChange(name, url, index, onChange)}
                disabled={false} />
            </Col>
            <Col lg>
              <label>Logo</label>
              <ImageUpload
                name='canvas.logo'
                src={campaign.canvas && campaign.canvas.logo}
                onChange={(name, url) => onImageInputChange(name, url, index, onChange)}
                disabled={false} />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

const onImageInputChange = (key, value, i, onChange) => {
  if (key.includes('assets')) {
    value = value.length ? [{url: value}] : []
  }
  onChange(key, value, i)
}

Canvas.propTypes = {
  campaign: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
}

export default Canvas

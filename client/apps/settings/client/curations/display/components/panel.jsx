import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'
import CharacterLimitInput from 'client/components/character_limit/index.jsx'

const Panel = (props) => {
  const {campaign, index, onChange} = props
  return (
    <div className='display-admin__section--panel'>
      <div className='display-admin__section-title'>Panel</div>
        <Row key={index}>
          <Col lg>
            <div className='field-group'>
              <CharacterLimitInput
                label='Headline'
                placeholder='Headline'
                defaultValue={campaign.panel ? campaign.panel.headline : ''}
                onChange={(value) => onChange('panel.headline', value, index)}
                limit={25} />
            </div>
            <div className='field-group'>
            <label>CTA link</label>
            <input
              className='bordered-input'
              placeholder='Find Out More'
              defaultValue={campaign.canvas && campaign.panel.link ? campaign.panel.link.url : ''}
              onChange={(e) => onChange('panel.link.url', e.target.value, index)} />
            </div>
            <div className='field-group'>
              <CharacterLimitInput
                type='textarea'
                label='Body'
                placeholder='Body'
                defaultValue={campaign.panel ? campaign.panel.body : ''}
                onChange={(value) => onChange('panel.body', value, index)}
                html
                limit={45} />
            </div>
          </Col>
          <Col lg>
            <Row key={index}>
              <Col lg>
                <label>Image</label>
                <ImageUpload
                  name='panel.assets'
                  src={campaign.panel.assets && campaign.panel.assets[0] ? campaign.panel.assets[0].url : ''}
                  onChange={(name, url) => onImageInputChange(name, url, index, onChange)} />
              </Col>
              <Col lg>
                <label>Logo</label>
                <ImageUpload
                  name='panel.logo'
                  src={campaign.panel && campaign.panel.logo}
                  onChange={(name, url) => onImageInputChange(name, url, index, onChange)} />
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

Panel.propTypes = {
  campaign: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
}

export default Panel

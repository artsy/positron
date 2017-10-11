import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'

import CanvasImages from './canvas_images.jsx'
import CharacterLimitInput from 'client/components/character_limit/index.jsx'

export default class Canvas extends React.Component {

  render () {
    const {campaign, index, onChange} = this.props
    const isSlideshow = campaign.canvas && campaign.canvas.layout === 'slideshow'

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
                    defaultValue={campaign.canvas ? campaign.canvas.headline : ''}
                    onChange={(html) => onChange('canvas.headline', html, index)}
                    html
                    limit={70} />
                : <CharacterLimitInput
                    label='headline'
                    placeholder='Headline'
                    defaultValue={campaign.canvas ? campaign.canvas.headline : ''}
                    onChange={(e) => onChange('canvas.headline', e.target.value, index)}
                    limit={45} />
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
                limit={150} />
            </div>
          </Col>
          <Col lg>
            <CanvasImages
              key={index}
              campaign={campaign}
              index={index}
              onChange={onChange}
              isSlideshow={isSlideshow} />
          </Col>
        </Row>
      </div>
    )
  }
}

Canvas.propTypes = {
  campaign: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
}

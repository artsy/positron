import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'

import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'
import CharacterLimitInput from 'client/components/character_limit/index.jsx'

export default class Canvas extends React.Component {
  renderAssets = () => {
    const { assets } = this.props.campaign.canvas
    const uploads = assets.map((asset, imgIndex) => {
      return this.renderImageUpload(assets, imgIndex)
    })
    return uploads
  }

  renderImageUpload = (assets, imgIndex) => {
    return (
      <ImageUpload
        key={'canvas-assets-' + imgIndex}
        name='canvas.assets'
        hasVideo
        src={assets[imgIndex] ? assets[imgIndex].url : ''}
        onChange={(name, url) => this.onImageInputChange(name, url, imgIndex)}
        disabled={false} />
    )
  }

  onSlideshowImageChange = (imgIndex, url) => {
    const { assets } = this.props.campaign.canvas

    if (imgIndex || imgIndex === 0) {
      if (url.length) {
        assets[imgIndex].url = url
      } else {
        assets.splice(imgIndex, 1)
      }
    } else {
      assets.push({ url })
    }
    return assets
  }

  onImageInputChange = (key, value, imgIndex) => {
    const { canvas } = this.props.campaign
    let newValue
    if (canvas.layout === 'slideshow') {
      newValue = this.onSlideshowImageChange(imgIndex, value)
    } else {
      newValue = value.length ? [{url: value}] : []
    }
    this.props.onChange(key, newValue, this.props.index)
  }

  render () {
    const {campaign, index, onChange} = this.props
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
                {campaign.canvas.layout === 'slideshow'
                  ? this.renderAssets(campaign, index, onChange)
                  : this.renderImageUpload(campaign.canvas.assets || [], 0)
                }
              </Col>
              <Col lg>
                <label>Logo</label>
                <ImageUpload
                  name='canvas.logo'
                  src={campaign.canvas && campaign.canvas.logo}
                  onChange={(name, url) => onChange(name, url, this.props.index)}
                  disabled={false} />
              </Col>
            </Row>
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

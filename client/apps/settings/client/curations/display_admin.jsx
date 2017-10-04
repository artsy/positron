import React from 'react'
import _ from 'underscore'
import set from 'lodash.set'
import { Col, Row } from 'react-styled-flexboxgrid'
import DropdownHeader from 'client/apps/edit/components/admin/components/dropdown_header.coffee'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'
import CharacterLimitInput from 'client/components/character_limit/index.jsx'

export default class DisplayAdmin extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      curation: props.curation,
      saveStatus: 'Save'
    }
  }

  onImageInputChange = (key, value, i) => {
    if (key.includes('assets')) {
      value = value.length ? [{url: value}] : []
    }
    return this.onChange(key, value, i)
  }

  onInputChange = (e, i) => {
    this.onChange(e.target.name, e.target.value, i)
  }

  onChange (key, value, index) {
    const newCuration = this.state.curation.clone()
    const campaign = newCuration.get('campaigns')[index]
    set(campaign, key, value)

    this.setState({
      curation: newCuration,
      saveStatus: 'Save'
    })
  }

  save = () => {
    this.state.curation.save({}, {
      success: () => this.setState({ saveStatus: 'Saved' }),
      error: error => this.setState({ saveStatus: 'Error' })
    })
  }

  render () {
    return (
      <div>
        {_.map(this.state.curation.get('campaigns'), (campaign, index) =>
          <div className='display-admin__container admin-form-container' key={`display-admin-${index}`}>
            <DropdownHeader
              section={campaign.name}
              key={`dropdown-${index}`}
              className='display-admin__section-header' />
            <div className='display-admin__section'>
              <Row key={index}>
                <Col lg>
                  <label>Title</label>
                  <input
                    className='bordered-input'
                    placeholder='Partner Name'
                    defaultValue={campaign.name}
                    onChange={(e) => this.onInputChange(e, index)}
                    name='name' />
                </Col>
                <Col lg>
                  <label>Start Date</label>
                  <input
                    type='date'
                    className='bordered-input'
                    placeholder='Start Date'
                    defaultValue={campaign.start_date}
                    onChange={(e) => this.onInputChange(e, index)}
                    name='start_date' />
                </Col>
                <Col lg>
                  <label>End Date</label>
                  <input
                    type='date'
                    className='bordered-input'
                    placeholder='Title'
                    defaultValue={campaign.end_date}
                    onChange={(e) => this.onInputChange(e, index)}
                    name='end_date' />
                </Col>
                <Col lg>
                  <label>Traffic Quantity</label>
                  <select
                    className='bordered-input'
                    onChange={(e) => this.onInputChange(e, index)} >
                    <option value='0.25'>25%</option>
                    <option value='0.50'>50%</option>
                    <option value='0.75'>75%</option>
                  </select>
                </Col>
              </Row>
            </div>

            <div className='display-admin__section_title'>Panel</div>
            <div className='display-admin__section'>
              <Row key={index}>
                <Col lg>
                  <div className='field-group'>
                    <CharacterLimitInput
                      label='headline'
                      placeholder='Headline'
                      defaultValue={campaign.panel ? campaign.panel.headline : ''}
                      onChange={(e) => this.onInputChange(e, index)}
                      name='panel.headline'
                      limit={25} />
                  </div>
                  <div className='field-group'>
                    <CharacterLimitInput
                      type='textarea'
                      label='Body'
                      placeholder='Body'
                      defaultValue={campaign.panel ? campaign.panel.body : ''}
                      onChange={(e) => this.onInputChange(e, index)}
                      name='panel.body'
                      limit={90} />
                  </div>
                </Col>
                <Col lg>
                  <Row key={index}>
                    <Col lg>
                      <label>Image</label>
                      <ImageUpload
                        name='panel.assets'
                        src={campaign.panel.assets[0] ? campaign.panel.assets[0].url : ''}
                        onChange={(name, url) => this.onImageInputChange(name, url, index)}
                        disabled={false} />
                    </Col>
                    <Col lg>
                      <label>Logo</label>
                      <ImageUpload
                        name='panel.logo'
                        src={campaign.panel && campaign.panel.logo}
                        onChange={(name, url) => this.onImageInputChange(name, url, index)}
                        disabled={false} />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>

            <button className='avant-garde-button' onClick={this.save}>
              {this.state.saveStatus}
            </button>
          </div>
        )}
      </div>
    )
  }
}

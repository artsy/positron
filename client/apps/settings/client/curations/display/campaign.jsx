import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'

const DisplayAdminCampaign = (props) => {
  const {campaign, index, onChange} = props
  return (
    <div className='display-admin__section--campaign'>
      <Row key={index}>
        <Col lg>
          <label>Title</label>
          <input
            className='bordered-input'
            placeholder='Partner Name'
            defaultValue={campaign.name}
            onChange={(e) => onChange('name', e.target.value, index)} />
        </Col>
        <Col lg>
          <label>Start Date</label>
          <input
            type='date'
            className='bordered-input'
            placeholder='Start Date'
            defaultValue={campaign.start_date}
            onChange={(e) => onChange('start_date', e.target.value, index)} />
        </Col>
        <Col lg>
          <label>End Date</label>
          <input
            type='date'
            className='bordered-input'
            placeholder='Title'
            defaultValue={campaign.end_date}
            onChange={(e) => onChange('end_date', e.target.value, index)} />
        </Col>
        <Col lg>
          <label>Traffic Quantity</label>
          <select
            className='bordered-input'
            onChange={(e) => onChange('sov', e.target.value, index)} >
            <option value='0.25'>25%</option>
            <option value='0.50'>50%</option>
            <option value='0.75'>75%</option>
          </select>
        </Col>
      </Row>
    </div>
  )
}

DisplayAdminCampaign.propTypes = {
  campaign: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
}

export default DisplayAdminCampaign

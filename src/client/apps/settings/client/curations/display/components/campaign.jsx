import moment from "moment"
import PropTypes from "prop-types"
import React from "react"
import { Col, Row } from "react-styled-flexboxgrid"

function onChangeDate(name, value, index, onChange) {
  const date = moment(value).toISOString()
  onChange(name, date, index)
}

export const Campaign = props => {
  const { campaign, index, onChange } = props

  return (
    <div className="display-admin__section--campaign">
      <Row key={index}>
        <Col lg>
          <label>Title</label>
          <input
            className="bordered-input"
            placeholder="Partner Name"
            defaultValue={campaign.name}
            onChange={e => onChange("name", e.target.value, index)}
          />
        </Col>
        <Col lg>
          <label>Start Date</label>
          <input
            type="date"
            className="bordered-input"
            defaultValue={
              campaign.start_date &&
              moment(campaign.start_date).format("YYYY-MM-DD")
            }
            onChange={e =>
              onChangeDate("start_date", e.target.value, index, onChange)
            }
          />
        </Col>
        <Col lg>
          <label>End Date</label>
          <input
            type="date"
            className="bordered-input"
            defaultValue={
              campaign.end_date &&
              moment(campaign.end_date).format("YYYY-MM-DD")
            }
            onChange={e =>
              onChangeDate("end_date", e.target.value, index, onChange)
            }
          />
        </Col>
        <Col lg>
          <label>Traffic Quantity</label>
          <select
            value={campaign.sov && campaign.sov.toFixed(2)}
            className="bordered-input"
            onChange={e => onChange("sov", parseFloat(e.target.value), index)}
          >
            <option value="0">0</option>
            <option value="0.20">20%</option>
          </select>
        </Col>
      </Row>
    </div>
  )
}

Campaign.propTypes = {
  campaign: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}

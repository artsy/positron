import { Box, Col, LargeSelect, Row } from "@artsy/palette"
import { garamond } from "@artsy/reaction/dist/Assets/Fonts"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { FormLabel } from "client/components/form_label"
import moment from "moment"
import React from "react"
import styled from "styled-components"

function onChangeDate(name, value, index, onChange) {
  const date = moment(value).toISOString()
  onChange(name, date, index)
}

export interface CampaignProps {
  campaign: any
  index: number
  onChange: (key: string, val: any, index: number) => void
}

export const Campaign: React.SFC<CampaignProps> = props => {
  const { campaign, index, onChange } = props

  return (
    <CampaignWrapper>
      <Row>
        <Col lg pb={4} pr={[0, 0.5]}>
          <FormLabel>Title</FormLabel>
          <Input
            block
            placeholder="Partner Name"
            defaultValue={campaign.name}
            onChange={e => onChange("name", e.currentTarget.value, index)}
          />
        </Col>
        <Col lg pb={4} px={[0, 0.5]}>
          <FormLabel>Start Date</FormLabel>
          <Input
            block
            type="date"
            defaultValue={
              campaign.start_date &&
              moment(campaign.start_date).format("YYYY-MM-DD")
            }
            onChange={e =>
              onChangeDate("start_date", e.currentTarget.value, index, onChange)
            }
          />
        </Col>
        <Col lg pb={4} px={[0, 0.5]}>
          <FormLabel>End Date</FormLabel>
          <Input
            block
            type="date"
            defaultValue={
              campaign.end_date &&
              moment(campaign.end_date).format("YYYY-MM-DD")
            }
            onChange={e =>
              onChangeDate("end_date", e.currentTarget.value, index, onChange)
            }
          />
        </Col>
        <Col lg pb={4} pl={[0, 0.5]}>
          <FormLabel>Traffic Quantity</FormLabel>
          <Box py={1}>
            <LargeSelect
              selected={campaign.sov && campaign.sov.toString()}
              onSelect={val => onChange("sov", parseFloat(val), index)}
              options={[
                {
                  text: "0",
                  value: "0",
                },
                {
                  text: "20%",
                  value: "0.2",
                },
              ]}
            />
          </Box>
        </Col>
      </Row>
    </CampaignWrapper>
  )
}

const CampaignWrapper = styled.div`
  input[type="date"] {
    padding: 6px 10px;
  }
  select {
    ${garamond("s17")};
    padding: 10px;
  }
`

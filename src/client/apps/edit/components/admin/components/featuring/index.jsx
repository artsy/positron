import React from "react"
import { Col, Row } from "react-styled-flexboxgrid"
import { FeaturingMentioned } from "./featuring_mentioned"
import AutocompleteListMetaphysics from "client/components/autocomplete2/list_metaphysics"

export const AdminFeaturing = props => {
  return (
    <div>
      <Row>
        <Col xs={6}>
          <AutocompleteListMetaphysics
            field="partner_ids"
            label="Partners"
            model="partners"
            placeholder="Search by partner name..."
          />
        </Col>

        <Col xs={6}>
          <AutocompleteListMetaphysics
            field="fair_ids"
            label="Fairs"
            model="fairs"
            placeholder="Search by fair name..."
          />
        </Col>
      </Row>

      <Row>
        <Col xs={6}>
          <AutocompleteListMetaphysics
            field="show_ids"
            label="Shows"
            model="partner_shows"
            placeholder="Search by show name..."
          />
        </Col>

        <Col xs={6}>
          <AutocompleteListMetaphysics
            field="auction_ids"
            label="Auctions"
            model="sales"
            placeholder="Search by auction name..."
          />
        </Col>
      </Row>

      <Row>
        <Col xs={6}>
          <FeaturingMentioned model="artist" />
        </Col>

        <Col xs={6}>
          <FeaturingMentioned model="artwork" />
        </Col>
      </Row>
    </div>
  )
}

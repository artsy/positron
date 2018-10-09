import React from "react"
import { Col, Row } from "react-styled-flexboxgrid"
import AutocompleteListMetaphysics from "client/components/autocomplete2/list_metaphysics"

export const AdminAppearances = props => {
  return (
    <div>
      <Row>
        <Col xs={6}>
          <AutocompleteListMetaphysics
            field="fair_programming_ids"
            label="Fair Programming"
            model="fairs"
            placeholder="Search by fair name..."
          />
        </Col>

        <Col xs={6}>
          <AutocompleteListMetaphysics
            field="fair_artsy_ids"
            label="Artsy at the Fair"
            model="fairs"
            placeholder="Search by fair name..."
          />
        </Col>
      </Row>

      <Row>
        <Col xs={6}>
          <AutocompleteListMetaphysics
            field="fair_about_ids"
            label="About the Fair"
            model="fairs"
            placeholder="Search by fair name..."
          />
        </Col>

        <Col xs={6}>
          <AutocompleteListMetaphysics
            field="biography_for_artist_id"
            label="Extended Artist Biography"
            model="artists"
            placeholder="Search by artist name..."
            type="single"
          />
        </Col>
      </Row>
    </div>
  )
}

import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import MetaphysicsAutocomplete from './metaphysics_autocomplete'

export const AdminAppearances = (props) => {
  return (
    <div>
      <Row>
        <Col xs={6}>
          <MetaphysicsAutocomplete
            field='fair_programming_ids'
            label='Fair Programming'
            model='fairs'
            placeholder='Search by fair name...'
          />
        </Col>

        <Col xs={6}>
          <MetaphysicsAutocomplete
            field='fair_artsy_ids'
            label='Artsy at the Fair'
            model='fairs'
            placeholder='Search by fair name...'
          />
        </Col>
      </Row>

      <Row>
        <Col xs={6}>
          <MetaphysicsAutocomplete
            field='fair_about_ids'
            label='About the Fair'
            model='fairs'
            placeholder='Search by fair name...'
          />
        </Col>

        <Col xs={6}>
          <MetaphysicsAutocomplete
            field='biography_for_artist_id'
            label='Extended Artist Biography'
            model='artists'
            placeholder='Search by artist name...'
          />
        </Col>
      </Row>
    </div>
  )
}

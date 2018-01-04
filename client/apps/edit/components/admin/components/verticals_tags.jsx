import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import Verticals from '../../../../../collections/verticals.coffee'

export class AdminVerticalsTags extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChange: PropTypes.func
  }

  constructor (props) {
    super(props)
    const { article } = props

    this.state = {
      vertical: article.get('vertical') || null,
      verticals: []
    }
  }

  componentWillMount = () => {
    this.fetchVerticals()
  }

  fetchVerticals = async () => {
    new Verticals().fetch({
      cache: true,
      success: (verticals) => {
        let sortedVerticals = verticals.sortBy('name')
        this.setState({verticals: sortedVerticals})
      }
    })
  }

  renderVerticalsList = () => {
    const { verticals } = this.state
    const { article, onChange } = this.props
    const { name } = article.get('vertical')

    return verticals.map((item, index) => {
      const isActive = item.get('name') === name
      const activeClass = isActive ? 'avant-garde-button-black' : ''

      return (
        <button
          key={index}
          className={`avant-garde-button ${activeClass}`}
          data-active={isActive}
          onClick={() => {
            const vertical = isActive ? null : item.attributes
            onChange('vertical', vertical)
          }}
        >
          {item.get('name')}
        </button>
      )
    })
  }

  render () {
    return (
      <Row className='AdminVerticalsTags edit-admin--verticals-tags'>

        <Col xs={6} className='field-group'>
          <label>Editorial Vertical</label>
          {this.renderVerticalsList()}
        </Col>

        <Col xs={6} className='field-group'>
          <label>AdminVerticalsTags</label>
        </Col>

      </Row>
    )
  }
}

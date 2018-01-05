import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { data as sd } from 'sharify'
import Verticals from '../../../../../collections/verticals.coffee'
import { AutocompleteInlineList } from '/client/components/autocomplete2/inline_list'

export class AdminVerticalsTags extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChange: PropTypes.func
  }

  state = {
    vertical: this.props.article.get('vertical') || null,
    verticals: []
  }

  componentWillMount = () => {
    this.fetchVerticals()
  }

  fetchVerticals = () => {
    new Verticals().fetch({
      cache: true,
      success: (verticals) => {
        const sortedVerticals = verticals.sortBy('name')
        this.setState({ verticals: sortedVerticals })
      }
    })
  }

  renderVerticalsList = () => {
    const { verticals } = this.state
    const { article, onChange } = this.props
    const name = article.get('vertical') && article.get('vertical').name

    return verticals.map((item, index) => {
      const isActive = name && item.get('name') === name
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
    const { article, onChange } = this.props

    return (
      <Row className='AdminVerticalsTags'>

        <Col xs={6} className='field-group verticals'>
          <label>Editorial Vertical</label>
          {this.renderVerticalsList()}
        </Col>

        <Col xs={6} className='field-group'>

          <div className='field-group tags'>
            <label>Topic Tags</label>
            <AutocompleteInlineList
              items={article.get('tags') || []}
              filter={(tags) => {
                return tags.results.map((tag) => {
                  return { id: tag.id, name: tag.name }
                })
              }}
              formatSelected={(tag) => tag.name}
              onSelect={(tags) => onChange('tags', tags)}
              placeholder='Start typing a topic tag...'
              url={`${sd.API_URL}/tags?public=true&q=%QUERY`}
            />
          </div>

          <div className='field-group tracking-tags'>
            <label>Tracking Tags</label>
            <AutocompleteInlineList
              items={article.get('tracking_tags') || []}
              filter={(tags) => {
                return tags.results.map((tag) => {
                  return { id: tag.id, name: tag.name }
                })
              }}
              formatSelected={(tag) => tag.name}
              onSelect={(tags) => onChange('tracking_tags', tags)}
              placeholder='Start typing a tracking tag...'
              url={`${sd.API_URL}/tags?public=false&q=%QUERY`}
            />
          </div>
        </Col>

      </Row>
    )
  }
}

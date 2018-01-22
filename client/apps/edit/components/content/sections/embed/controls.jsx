import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import SectionControls from '../../section_controls/index'

export const EmbedControls = (props) => {
  const {
    articleLayout,
    section
  } = props

  return (
    <div className='EmbedControls'>
      <SectionControls
        section={section}
        articleLayout={articleLayout}
        sectionLayouts
      >
        <Row>
          <Col xs={12}>
            <h2>iFrame URL</h2>
            <input
              autoFocus
              className='bordered-input bordered-input-dark'
              defaultValue={section.get('url') || ''}
              onChange={(e) => section.set('url', e.target.value)}
              placeholder='https://files.artsy.net'
            />
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <h2>Height (optional)</h2>
            <input
              className='bordered-input bordered-input-dark'
              defaultValue={section.get('height') || ''}
              onChange={(e) => section.set('height', e.target.value)}
              placeholder='400'
            />
          </Col>
          <Col xs={6}>
            <h2>Mobile Height (optional)</h2>
            <input
              className='bordered-input bordered-input-dark'
              defaultValue={section.get('mobile_height') || ''}
              onChange={(e) => section.set('mobile_height', e.target.value)}
              placeholder='300'
            />
          </Col>
        </Row>
      </SectionControls>
    </div>
  )
}

EmbedControls.propTypes = {
  articleLayout: PropTypes.string.isRequired,
  section: PropTypes.object.isRequired
}

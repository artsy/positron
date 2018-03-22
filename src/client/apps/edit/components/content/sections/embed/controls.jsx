import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import SectionControls from '../../section_controls/index'
import { onChangeSection, removeSection } from 'client/actions/editActions'

export class EmbedControls extends Component {
  static propTypes = {
    onChangeSectionAction: PropTypes.func.isRequired,
    removeSectionAction: PropTypes.func.isRequired,
    section: PropTypes.object.isRequired,
    sectionIndex: PropTypes.number
  }

  componentWillUnmount = () => {
    const {
      removeSectionAction,
      section,
      sectionIndex
    } = this.props

    if (!section.url) {
      removeSectionAction(sectionIndex)
    }
  }

  render () {
    const {
      onChangeSectionAction,
      section
    } = this.props

    return (
      <div className='EmbedControls'>
        <SectionControls
          section={section}
          showLayouts
        >
          <Row>
            <Col xs={12}>
              <h2>iFrame URL</h2>
              <input
                autoFocus
                className='bordered-input bordered-input-dark'
                value={section.url || ''}
                onChange={(e) => onChangeSectionAction('url', e.target.value)}
                placeholder='https://files.artsy.net'
              />
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <h2>Height (optional)</h2>
              <input
                className='bordered-input bordered-input-dark'
                value={section.height || ''}
                onChange={(e) => onChangeSectionAction('height', e.target.value)}
                placeholder='400'
              />
            </Col>
            <Col xs={6}>
              <h2>Mobile Height (optional)</h2>
              <input
                className='bordered-input bordered-input-dark'
                value={section.mobile_height || ''}
                onChange={(e) => onChangeSectionAction('mobile_height', e.target.value)}
                placeholder='300'
              />
            </Col>
          </Row>
        </SectionControls>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  sectionIndex: state.edit.sectionIndex
})

const mapDispatchToProps = {
  onChangeSectionAction: onChangeSection,
  removeSectionAction: removeSection
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmbedControls)

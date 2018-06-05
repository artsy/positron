import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import SectionControls from '../../section_controls/index'
import { onChangeSection, removeSection } from 'client/actions/edit/sectionActions'

export class SocialEmbedControls extends Component {
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
      <div className='SocialEmbedControls'>
        <SectionControls
          section={section}
        >
          <Row>
            <Col xs={12}>
              <h2>Social URL</h2>
              <input
                autoFocus
                className='bordered-input bordered-input-dark'
                value={section.url || ''}
                onChange={(e) => onChangeSectionAction('url', e.target.value)}
                placeholder='https://www.instagram.com/'
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
)(SocialEmbedControls)

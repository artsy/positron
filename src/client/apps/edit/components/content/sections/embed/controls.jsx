import PropTypes from "prop-types"
import { connect } from "react-redux"
import React, { Component } from "react"
import { Col, Flex, Row } from "@artsy/palette"
import SectionControls from "../../section_controls"
import {
  onChangeSection,
  removeSection,
} from "client/actions/edit/sectionActions"
import { FormLabel } from "client/components/form_label"
import { Input } from "@artsy/reaction/dist/Components/Input"

export class EmbedControls extends Component {
  static propTypes = {
    onChangeSectionAction: PropTypes.func.isRequired,
    removeSectionAction: PropTypes.func.isRequired,
    section: PropTypes.object.isRequired,
    sectionIndex: PropTypes.number,
  }

  componentWillUnmount = () => {
    const { removeSectionAction, section, sectionIndex } = this.props

    if (!section.url) {
      removeSectionAction(sectionIndex)
    }
  }

  render() {
    const { onChangeSectionAction, section } = this.props

    return (
      <div className="EmbedControls">
        <SectionControls section={section} showLayouts>
          <Row>
            <Col xs={12}>
              <FormLabel color="white">iFrame URL</FormLabel>
              <Input
                autoFocus
                block
                value={section.url || ""}
                onChange={e =>
                  onChangeSectionAction("url", e.currentTarget.value)
                }
                placeholder="https://files.artsy.net"
              />
            </Col>
          </Row>
          <Flex>
            <Col xs={6} pr={2}>
              <FormLabel color="white">Height (optional)</FormLabel>
              <Input
                block
                value={section.height || ""}
                onChange={e =>
                  onChangeSectionAction("height", e.currentTarget.value)
                }
                placeholder="400"
              />
            </Col>
            <Col xs={6} pl={2}>
              <FormLabel color="white">Mobile Height (optional)</FormLabel>
              <Input
                block
                value={section.mobile_height || ""}
                onChange={e =>
                  onChangeSectionAction("mobile_height", e.currentTarget.value)
                }
                placeholder="300"
              />
            </Col>
          </Flex>
        </SectionControls>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  sectionIndex: state.edit.sectionIndex,
})

const mapDispatchToProps = {
  onChangeSectionAction: onChangeSection,
  removeSectionAction: removeSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmbedControls)

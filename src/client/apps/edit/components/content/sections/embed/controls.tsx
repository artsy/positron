import { Col, Flex, Row } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { SectionData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import {
  onChangeSection,
  removeSection,
} from "client/actions/edit/sectionActions"
import { FormLabel } from "client/components/form_label"
import React, { Component } from "react"
import { connect } from "react-redux"
import SectionControls from "../../section_controls"

interface EmbedControlsProps {
  onChangeSectionAction: (key: string, val: any) => void
  removeSectionAction: (i: number) => void
  section: SectionData
  sectionIndex: number
}

export class EmbedControls extends Component<EmbedControlsProps> {
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

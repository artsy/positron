import { Input } from "@artsy/reaction/dist/Components/Input"
import { SectionData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import {
  onChangeSection,
  removeSection,
} from "client/actions/edit/sectionActions"
import SectionControls from "client/apps/edit/components/content/section_controls"
import { FormLabel } from "client/components/form_label"
import React, { Component } from "react"
import { connect } from "react-redux"

interface SocialEmbedControlsProps {
  onChangeSectionAction: (key: string, val: any) => void
  removeSectionAction: (i: number) => void
  section: SectionData
  sectionIndex: number
}

export class SocialEmbedControls extends Component<SocialEmbedControlsProps> {
  componentWillUnmount = () => {
    const { removeSectionAction, section, sectionIndex } = this.props

    if (!section.url) {
      removeSectionAction(sectionIndex)
    }
  }

  render() {
    const { onChangeSectionAction, section } = this.props

    return (
      <SectionControls>
        <FormLabel color="white">Social URL</FormLabel>
        <Input
          block
          autoFocus
          value={section.url || ""}
          onChange={e => onChangeSectionAction("url", e.currentTarget.value)}
          placeholder="https://www.instagram.com/"
        />
      </SectionControls>
    )
  }
}

const mapStateToProps = state => ({
  sectionIndex: state.edit.sectionIndex,
  section: state.edit.section,
})

const mapDispatchToProps = {
  onChangeSectionAction: onChangeSection,
  removeSectionAction: removeSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SocialEmbedControls)

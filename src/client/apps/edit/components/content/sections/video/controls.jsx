import PropTypes from "prop-types"
import React, { Component } from "react"
import { connect } from "react-redux"
import { Flex } from "@artsy/palette"
import FileInput from "client/components/file_input"
import SectionControls from "../../section_controls/index.tsx"
import { isEmpty } from "underscore"
import { isWebUri } from "valid-url"
import { removeSection } from "client/actions/edit/sectionActions"
import { FormLabel } from "client/components/form_label"
import { RadioInput } from "../images/components/controls"
import {
  ASPECT_RATIO_OPTIONS,
  DEFAULT_ASPECT_RATIO,
  detectAspectRatio,
  formatAspectRatio,
  isAspectRatio,
} from "./utils"

export class VideoSectionControls extends Component {
  static propTypes = {
    editSection: PropTypes.object,
    isHero: PropTypes.bool,
    removeSectionAction: PropTypes.func,
    section: PropTypes.object,
    sectionIndex: PropTypes.number,
    showLayouts: PropTypes.bool,
    onChange: PropTypes.func,
    onProgress: PropTypes.func,
  }

  componentWillUnmount = () => {
    // Drop any in-flight detection; by now edits target another section
    this.detectingUrl = null

    const {
      removeSectionAction,
      editSection,
      isHero,
      sectionIndex,
    } = this.props

    if (!isHero && !editSection.url) {
      removeSectionAction(sectionIndex)
    }
  }

  onCoverImageChange = url => {
    const { onChange } = this.props
    const isValid = isEmpty(url) || isWebUri(url)

    if (isValid) {
      onChange("cover_image_url", url)
    }
  }

  onVideoUrlChange = url => {
    const { onChange } = this.props

    if (isEmpty(url)) {
      onChange("url", "")
      onChange("cover_image_url", "")
      this.detectAspectRatio("")
    } else if (isWebUri(url)) {
      onChange("url", url)
      this.detectAspectRatio(url)
    }
  }

  // Hero videos render at 16:9 on artsy.net, so only body sections get a ratio
  detectAspectRatio = async url => {
    const { isHero, onChange } = this.props

    if (isHero) return
    this.detectingUrl = url

    const aspectRatio = url ? await detectAspectRatio(url) : null
    if (this.detectingUrl === url) {
      onChange("aspect_ratio", aspectRatio)
    }
  }

  // A manual pick wins over any detection still in flight
  selectAspectRatio = aspectRatio => {
    this.detectingUrl = null
    this.props.onChange("aspect_ratio", aspectRatio)
  }

  renderAspectRatios() {
    const { section } = this.props
    const current = section.aspect_ratio || DEFAULT_ASPECT_RATIO
    const isPreset = ASPECT_RATIO_OPTIONS.some(({ value }) =>
      isAspectRatio(value, current)
    )
    // Keep an odd detected ratio (e.g. 2.39:1 from Vimeo) selectable
    const options = isPreset
      ? ASPECT_RATIO_OPTIONS
      : [{ label: formatAspectRatio(current), value: current }].concat(
          ASPECT_RATIO_OPTIONS
        )

    return (
      <Flex alignItems="center" pb={1}>
        <FormLabel color="white">Aspect Ratio:</FormLabel>
        <Flex pl={2} flexWrap="wrap">
          {options.map(({ label, value }) => (
            <Flex key={label} alignItems="center" pr={2}>
              <RadioInput
                data-aspect-ratio={label}
                isActive={isAspectRatio(current, value)}
                onClick={() => this.selectAspectRatio(value)}
              />
              <FormLabel color="white">{label}</FormLabel>
            </Flex>
          ))}
        </Flex>
      </Flex>
    )
  }

  render() {
    const { isHero, section, showLayouts, onProgress } = this.props

    return (
      <SectionControls
        section={section}
        isHero={isHero}
        showLayouts={showLayouts}
      >
        <FormLabel color="white">Video</FormLabel>
        <input
          className="bordered-input bordered-input-dark"
          onChange={e => this.onVideoUrlChange(e.target.value)}
          value={section.url}
          placeholder="Paste a youtube or vimeo url (e.g. http://youtube.com/watch?v=id)"
          autoFocus
        />

        {!isHero && this.renderAspectRatios()}

        <FormLabel color="white">Cover Image</FormLabel>
        <FileInput
          onUpload={this.onCoverImageChange}
          onProgress={onProgress}
          hasImage={section.cover_image_url}
        />
      </SectionControls>
    )
  }
}

const mapStateToProps = state => ({
  editSection: state.edit.section,
  sectionIndex: state.edit.sectionIndex,
})

const mapDispatchToProps = {
  removeSectionAction: removeSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VideoSectionControls)

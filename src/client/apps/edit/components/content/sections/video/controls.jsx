import PropTypes from "prop-types"
import React, { Component } from "react"
import { connect } from "react-redux"
import FileInput from "client/components/file_input"
import SectionControls from "../../section_controls"
import { isEmpty } from "underscore"
import { isWebUri } from "valid-url"
import { removeSection } from "client/actions/edit/sectionActions"

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
    } else if (isWebUri(url)) {
      onChange("url", url)
    }
  }

  render() {
    const { isHero, section, showLayouts, onProgress } = this.props

    return (
      <SectionControls
        section={section}
        isHero={isHero}
        showLayouts={showLayouts}
      >
        <h2>Video</h2>
        <input
          className="bordered-input bordered-input-dark"
          onChange={e => this.onVideoUrlChange(e.target.value)}
          value={section.url}
          placeholder="Paste a youtube or vimeo url (e.g. http://youtube.com/watch?v=id)"
          autoFocus
        />
        <FileInput
          onUpload={this.onCoverImageChange}
          onProgress={onProgress}
          hasImage={section.cover_image_url}
          label="Cover Image"
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

//  Video section supports links from youtube or vimeo
import styled from 'styled-components'
import PropTypes from "prop-types"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import React, { Component } from "react"
import { connect } from "react-redux"
import VideoSectionControls from "./controls.jsx"
import { Video } from "@artsy/reaction/dist/Components/Publishing/Sections/Video"
import { ProgressBar } from "client/components/file_input/progress_bar"
import { RemoveButton, RemoveButtonContainer } from "client/components/remove_button"
import {
  onChangeHero,
  onChangeSection,
} from "client/actions/edit/sectionActions"

export class SectionVideo extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    hidePreview: PropTypes.bool,
    isHero: PropTypes.bool,
    onChangeHeroAction: PropTypes.func,
    onChangeSectionAction: PropTypes.func,
    section: PropTypes.object.isRequired,
  }

  state = {
    progress: null,
  }

  onProgress = progress => {
    this.setState({ progress })
  }

  onChange = (key, value) => {
    const { isHero, onChangeHeroAction, onChangeSectionAction } = this.props

    if (isHero) {
      onChangeHeroAction(key, value)
    } else {
      onChangeSectionAction(key, value)
    }
  }

  renderRemoveButton() {
    const { section } = this.props

    if (section.cover_image_url) {
      return (
        <RemoveButton onClick={() => this.onChange("cover_image_url", null)} />
      )
    } else if (section.url) {
      return <RemoveButton onClick={() => this.onChange("url", "")} />
    }
  }

  renderVideoEmbed() {
    const { section, article, editing, hidePreview } = this.props
    const hasUrl = Boolean(section.url)

    if (hidePreview) {
      return
    }

    if (hasUrl) {
      return (
        <Video layout={article.layout} section={section}>
          {editing && this.renderRemoveButton()}
          <Paragraph
            allowedStyles={["i"]}
            hasLinks
            html={section.caption}
            onChange={html => this.onChange("caption", html)}
            placeholder="Video Caption (required)"
            stripLinebreaks
            isReadOnly={!editing}
          />
        </Video>
      )
    } else {
      return <div className="edit-section__placeholder">Add a video above</div>
    }
  }

  render() {
    const { editing, hidePreview, isHero, section } = this.props
    const { progress } = this.state

    const showSectionLayouts = !isHero && !hidePreview

    return (
      <VideoContainer className="SectionVideo" editing={editing}>
        {editing && (
          <VideoSectionControls
            section={section}
            isHero={isHero}
            showLayouts={showSectionLayouts}
            onChange={this.onChange}
            onProgress={this.onProgress}
          />
        )}

        {this.renderVideoEmbed()}

        {progress && <ProgressBar progress={progress} />}
      </VideoContainer>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeHeroAction: onChangeHero,
  onChangeSectionAction: onChangeSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionVideo)

const VideoContainer = styled.section`
  position: relative;
  z-index: ${props => props.editing ? 10 : -1};

  ${RemoveButtonContainer} {
    width: 30px;
    height: 30px;
    position: absolute;
    top: -12px;
    right: -12px;
  }
`

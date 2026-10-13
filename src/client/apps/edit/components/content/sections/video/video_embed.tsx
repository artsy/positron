import { Caption } from "@artsy/reaction/dist/Components/Publishing/Sections/Caption"
import { CoverImage } from "@artsy/reaction/dist/Components/Publishing/Sections/Video"
import { VideoControls } from "@artsy/reaction/dist/Components/Publishing/Sections/VideoControls"
import { resize } from "@artsy/reaction/dist/Utils/resizer"
import { EditSectionPlaceholder } from "client/components/edit_section_placeholder"
import { ArticleLayout, SectionData } from "client/typings/sections"
import React, { Component } from "react"
import styled from "styled-components"
import { DEFAULT_ASPECT_RATIO, getEmbedSrc, MAX_VIDEO_HEIGHT } from "./utils"

interface Props {
  layout: ArticleLayout
  section: SectionData & { aspect_ratio?: number | null }
}

interface State {
  isPlaying: boolean
}

/**
 * Writer's video preview. Stands in for reaction's Video, which pins every
 * player to 16:9, so that portrait and square videos preview at their
 * saved `aspect_ratio`.
 */
export class VideoEmbed extends Component<Props, State> {
  state = {
    isPlaying: false,
  }

  render() {
    const { children, layout, section } = this.props
    const { isPlaying } = this.state
    const src = getEmbedSrc(section.url || "")
    const aspectRatio = section.aspect_ratio || DEFAULT_ASPECT_RATIO

    if (!src) {
      return (
        <EditSectionPlaceholder>
          Only YouTube and Vimeo links are supported
        </EditSectionPlaceholder>
      )
    }

    return (
      <VideoContainer layout={layout} className="VideoContainer">
        <Frame aspectRatio={aspectRatio}>
          <Ratio aspectRatio={aspectRatio}>
            {section.cover_image_url && (
              <CoverImage
                className="VideoCover"
                src={resize(section.cover_image_url, { width: 1200 })}
                hidden={isPlaying}
                onClick={() => this.setState({ isPlaying: true })}
              >
                <VideoControls />
              </CoverImage>
            )}
            <iframe
              src={isPlaying ? `${src}&autoplay=1` : src}
              frameBorder="0"
              allowFullScreen
            />
          </Ratio>
        </Frame>

        {layout !== "feature" && (
          <Caption caption={section.caption || ""} layout={layout}>
            {children}
          </Caption>
        )}
      </VideoContainer>
    )
  }
}

const VideoContainer = styled.div<{ layout: ArticleLayout }>`
  width: 100%;
  position: relative;

  ${props =>
    props.layout === "feature" &&
    `
      padding-bottom: 53px;
      max-width: 1200px;
      margin: 0 auto;
    `};
`

/** Narrows portrait players so they never run taller than the viewport cap. */
export const Frame = styled.div<{ aspectRatio: number }>`
  max-width: calc(${MAX_VIDEO_HEIGHT} * ${props => props.aspectRatio});
  margin: 0 auto;
`

const Ratio = styled.div<{ aspectRatio: number }>`
  position: relative;
  padding-bottom: ${props => 100 / props.aspectRatio}%;

  .VideoCover,
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .VideoCover {
    z-index: 1;
  }
`

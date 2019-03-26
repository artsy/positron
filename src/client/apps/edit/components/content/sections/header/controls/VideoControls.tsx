import { color, Sans, space } from "@artsy/palette"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import React from "react"
import styled from "styled-components"
import VideoSectionControls from "../../video/controls"

interface VideoControlsProps {
  article: ArticleData
  isOpen: boolean
  onChange: (key: any, val?: any) => void
  onProgress: (progress: number) => void
  onClick: () => void
}

export const VideoControls: React.SFC<VideoControlsProps> = props => {
  const { article, isOpen, onChange, onClick, onProgress } = props

  return (
    <VideoControlsContainer>
      <EmbedVideoControls size="4" weight="medium" onClick={onClick}>
        Embed Video +
      </EmbedVideoControls>

      {isOpen && (
        <ControlsContainer>
          <VideoSectionControls
            section={article.hero_section}
            onChange={onChange}
            onProgress={onProgress}
            isHero
          />
        </ControlsContainer>
      )}
    </VideoControlsContainer>
  )
}

// Exported for tests
export const EmbedVideoControls = styled(Sans)``

const VideoControlsContainer = styled.div`
  position: absolute;
  left: ${space(2)}px;
  top: ${space(2)}px;
  z-index: 3;
  text-align: left;
  cursor: pointer;
  user-select: none;
`

const ControlsContainer = styled.div`
  background: ${color("black100")};
  width: 520px;
  position: absolute;
  left: ${space(1)}px;
`

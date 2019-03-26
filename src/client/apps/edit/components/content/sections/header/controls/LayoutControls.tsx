import { Sans } from "@artsy/palette"
// import { IconLayoutBasic } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutBasic"
// import { IconLayoutFullscreen } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutFullscreen"
// import { IconLayoutSplit } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutSplit"
// import { IconLayoutText } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutText"
import React from "react"
import styled from "styled-components"

// TODO: use onChangeHero redux action

interface LayoutControlsProps {
  isOpen: boolean
  hero: any // heroSectionData
  onChange: (key: any, val?: any) => void
  onClick: () => void
}

export const LayoutControls: React.SFC<LayoutControlsProps> = props => {
  const { hero, isOpen, onClick, onChange } = props

  return (
    <div className="edit-header--controls">
      <div className="edit-header--controls__menu">
        <OpenControlsContainer
          onClick={onClick}
          className="edit-header--controls-open"
          color={getControlsColor(hero)}
        >
          <Sans size="4" weight="medium">
            Change Header +
          </Sans>
        </OpenControlsContainer>

        {isOpen && (
          <LayoutControlsContainer className="edit-header--controls__layout">
            <LayoutButton onClick={() => onChange("type", "text")}>
              {/* <IconLayoutText /> */}
              <Sans size="3" weight="medium">
                Default
              </Sans>
            </LayoutButton>
            <LayoutButton onClick={() => onChange("type", "fullscreen")}>
              {/* <IconLayoutFullscreen /> */}
              <Sans size="3" weight="medium">
                Overlay
              </Sans>
            </LayoutButton>
            <LayoutButton onClick={() => onChange("type", "split")}>
              {/* <IconLayoutSplit /> */}
              <Sans size="3" weight="medium">
                Split
              </Sans>
            </LayoutButton>
            <LayoutButton onClick={() => onChange("type", "basic")}>
              {/* <IconLayoutBasic /> */}
              <Sans size="3" weight="medium">
                Basic
              </Sans>
            </LayoutButton>
          </LayoutControlsContainer>
        )}
      </div>
    </div>
  )
}

export const OpenControlsContainer = styled.div`
  color: ${props => props.color};
`

const LayoutControlsContainer = styled.div`
  border: 2px solid;
  display: flex;
  margin-top: 5px;
  text-align: center;
`

const LayoutButton = styled.div`
  padding: 20px;
  border-right: 1px solid gray;
  background: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:last-child {
    border-right: none;
  }

  svg {
    margin: 0 10px 10px 10px;
  }
`

const getControlsColor = hero => {
  const { type, url } = hero

  if (hero && type === "fullscreen" && url && url.length) {
    return "white"
  } else {
    return "black"
  }
}

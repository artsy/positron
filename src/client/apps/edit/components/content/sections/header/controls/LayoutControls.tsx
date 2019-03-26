import { color, Flex, Sans } from "@artsy/palette"
import { IconLayoutBasic } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutBasic"
import { IconLayoutFullscreen } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutFullscreen"
import { IconLayoutSplit } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutSplit"
import { IconLayoutText } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutText"
import React from "react"
import styled from "styled-components"

interface LayoutControlsProps {
  isOpen: boolean
  hero: any // heroSectionData
  onChange: (key: any, val?: any) => void
  onClick: () => void
}

export const LayoutControls: React.SFC<LayoutControlsProps> = props => {
  const { hero, isOpen, onClick, onChange } = props

  return (
    <LayoutControlsContainer>
      <OpenControlsContainer onClick={onClick} color={getControlsColor(hero)}>
        <Sans size="4" weight="medium">
          Change Header +
        </Sans>
      </OpenControlsContainer>

      {isOpen && (
        <ControlsContainer>
          <LayoutButton onClick={() => onChange("type", "text")}>
            <IconLayoutText />
            <Sans size="3" weight="medium">
              Default
            </Sans>
          </LayoutButton>

          <LayoutButton onClick={() => onChange("type", "fullscreen")}>
            <IconLayoutFullscreen />
            <Sans size="3" weight="medium">
              Overlay
            </Sans>
          </LayoutButton>

          <LayoutButton onClick={() => onChange("type", "split")}>
            <IconLayoutSplit />
            <Sans size="3" weight="medium">
              Split
            </Sans>
          </LayoutButton>

          <LayoutButton onClick={() => onChange("type", "basic")}>
            <IconLayoutBasic />
            <Sans size="3" weight="medium">
              Basic
            </Sans>
          </LayoutButton>
        </ControlsContainer>
      )}
    </LayoutControlsContainer>
  )
}

const LayoutControlsContainer = styled.div`
  position: absolute;
  right: 20px;
  z-index: 3;
  text-align: right;
  user-select: none;
  padding: 20px 10px;
`

export const OpenControlsContainer = styled.div<{ color: string }>`
  color: ${props => props.color};
  cursor: pointer;
`

const ControlsContainer = styled.div`
  border: 2px solid;
  display: flex;
  margin-top: 5px;
  text-align: center;
`

const LayoutButton = styled(Flex)`
  padding: 15px 20px 10px;
  border-right: 1px solid ${color("black30")};
  background: ${color("white100")};
  cursor: pointer;
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

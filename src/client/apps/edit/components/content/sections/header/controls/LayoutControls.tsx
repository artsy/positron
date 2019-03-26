import { color, Flex, Sans, space } from "@artsy/palette"
import { IconLayoutBasic } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutBasic"
import { IconLayoutFullscreen } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutFullscreen"
import { IconLayoutSplit } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutSplit"
import { IconLayoutText } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutText"
import React from "react"
import styled from "styled-components"

interface LayoutControlsProps {
  isOpen: boolean
  hero: any // TODO: type hero_section
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

export const LayoutControlsContainer = styled.div`
  position: absolute;
  right: ${space(2)}px;
  z-index: 3;
  text-align: right;
  user-select: none;
  padding: ${space(2)}px ${space(1)}px;
`

export const OpenControlsContainer = styled.div<{ color: string }>`
  color: ${props => props.color};
  cursor: pointer;
`

export const ControlsContainer = styled.div`
  border: 2px solid;
  display: flex;
  margin-top: 5px;
  text-align: center;
`

export const LayoutButton = styled(Flex)`
  padding: 15px ${space(2)}px ${space(1)}px;
  border-right: 1px solid ${color("black30")};
  background: ${color("white100")};
  cursor: pointer;
  flex-direction: column;
  align-items: center;

  &:last-child {
    border-right: none;
  }

  svg {
    margin: 0 ${space(1)}px ${space(1)}px;
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

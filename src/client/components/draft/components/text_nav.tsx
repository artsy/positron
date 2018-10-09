import { color } from "@artsy/palette"
import { IconArtist } from "@artsy/reaction/dist/Components/Publishing/Icon/IconArtist"
import { IconBlockquote } from "@artsy/reaction/dist/Components/Publishing/Icon/IconBlockquote"
import { IconClearFormatting } from "@artsy/reaction/dist/Components/Publishing/Icon/IconClearFormatting"
import { IconLink } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLink"
import { IconOrderedList } from "@artsy/reaction/dist/Components/Publishing/Icon/IconOrderedList"
import { IconUnorderedList } from "@artsy/reaction/dist/Components/Publishing/Icon/IconUnorderedList"
import { getVisibleSelectionRect } from "draft-js"
import { flatten, map } from "lodash"
import React, { Component } from "react"
import styled from "styled-components"
import { BackgroundOverlay } from "./background_overlay"

const BUTTON_WIDTH = 50
const BUTTON_HEIGHT = 40

interface ButtonType {
  element?: string
  name: string
}

interface State {
  selectionPosition: ClientRect
}

interface Props {
  allowedBlocks?: any // TODO: type blockmap
  allowedStyles: any
  editorPosition: ClientRect | null
  hasFollowButton?: boolean
  onClickOff: () => void
  promptForLink?: (isFollowLink?: boolean) => void
  toggleBlock?: (command: string) => void
  togglePlainText?: () => void
  toggleStyle: (command: string) => void
}

/**
 * A popup UI to change block/style types, add links, or strip styles
 * available menu items are determined based on passed props
 */
export class TextNav extends Component<Props, State> {
  state = {
    selectionPosition: getVisibleSelectionRect(window),
  }

  getButtonsFromBlockMap = () => {
    const { allowedBlocks } = this.props
    const buttons: ButtonType[] = []

    if (allowedBlocks.get("header-one")) {
      buttons.push({
        element: "h1",
        name: "header-one",
      })
    }
    if (allowedBlocks.get("header-two")) {
      buttons.push({
        element: "h2",
        name: "header-two",
      })
    }
    if (allowedBlocks.get("header-three")) {
      buttons.push({
        element: "h3",
        name: "header-three",
      })
    }
    if (allowedBlocks.get("blockquote")) {
      buttons.push({
        name: "blockquote",
      })
    }
    if (allowedBlocks.get("ordered-list-item")) {
      buttons.push({
        name: "ordered-list-item",
      })
    }
    if (allowedBlocks.get("unordered-list-item")) {
      buttons.push({
        name: "unordered-list-item",
      })
    }
    return buttons
  }

  getButtonArray() {
    const {
      allowedBlocks,
      allowedStyles,
      hasFollowButton,
      promptForLink,
      togglePlainText,
    } = this.props
    const buttons: any = []

    if (allowedStyles) {
      buttons.push(allowedStyles)
    }
    if (allowedBlocks) {
      buttons.push(this.getButtonsFromBlockMap())
    }
    if (promptForLink) {
      buttons.push({ name: "link" })
    }
    if (hasFollowButton && promptForLink) {
      buttons.push({ name: "artist" })
    }
    if (togglePlainText) {
      buttons.push({ name: "clear-formatting" })
    }

    return flatten(buttons)
  }

  getIcon(type) {
    const props = { color: color("black30") }

    switch (type) {
      case "artist": {
        return <IconArtist {...props} />
      }
      case "blockquote": {
        return <IconBlockquote {...props} />
      }
      case "link": {
        return <IconLink {...props} />
      }
      case "ordered-list-item": {
        return <IconOrderedList {...props} />
      }
      case "clear-formatting": {
        return <IconClearFormatting {...props} />
      }
      case "unordered-list-item": {
        return <IconUnorderedList {...props} />
      }
    }
  }

  onToggle = action => {
    const {
      allowedBlocks,
      allowedStyles,
      promptForLink,
      toggleBlock,
      togglePlainText,
      toggleStyle,
    } = this.props
    const isValidBlock =
      allowedBlocks && Array.from(allowedBlocks.keys()).includes(action)

    if (toggleBlock && isValidBlock) {
      return toggleBlock(action)
    }
    if (map(allowedStyles, "name").includes(action)) {
      return toggleStyle(action)
    }

    switch (action) {
      case "artist": {
        return promptForLink && promptForLink(true)
      }
      case "link": {
        return promptForLink && promptForLink()
      }
      case "clear-formatting": {
        return togglePlainText && togglePlainText()
      }
    }
  }

  stickyControlsBox = () => {
    const { editorPosition } = this.props
    const { selectionPosition } = this.state
    const navDimensions = this.getNavDimensions()
    let top
    let left

    if (editorPosition) {
      top = selectionPosition.top - editorPosition.top - navDimensions.height
      left =
        selectionPosition.left -
        editorPosition.left +
        selectionPosition.width / 2 -
        navDimensions.width / 2
    }
    return { top, left }
  }

  getNavDimensions = () => {
    const buttons = this.getButtonArray()
    let width = buttons.length * BUTTON_WIDTH
    let height = BUTTON_HEIGHT

    if (buttons.length > 5) {
      // account for wrapping long menus
      width = buttons.length * (BUTTON_WIDTH / 2)
      height = BUTTON_HEIGHT * 2
    }
    return {
      height,
      width,
    }
  }

  render() {
    const { onClickOff } = this.props
    const { top, left } = this.stickyControlsBox()
    const buttons = this.getButtonArray()

    return (
      <>
        <BackgroundOverlay onClick={onClickOff} />
        <TextNavContainer top={top} left={left}>
          {buttons.map((button, i) => (
            <Button
              key={i}
              onMouseDown={(_e: any) => this.onToggle(button.name)}
              styleType={button.name}
            >
              {button.element ? button.element : this.getIcon(button.name)}
            </Button>
          ))}
        </TextNavContainer>
      </>
    )
  }
}

const TextNavContainer = styled.div.attrs<{ top: number; left: number }>({})`
  max-width: 250px;
  background: ${color("black100")};
  border-radius: 5px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  z-index: 10;
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top}px;

  &::after {
    content: "";
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 7px solid ${color("black100")};
    position: absolute;
    bottom: -7px;
    left: calc(50% - 7px);
  }
`

export const Button = styled.div.attrs<{ styleType: string }>({})`
  color: ${color("black30")};
  height: ${BUTTON_HEIGHT}px;
  width: ${BUTTON_WIDTH}px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 20px;
  svg {
    width: 18px;
    height: 18px;
    g {
      fill: ${color("black30")};
    }
  }
  &:hover {
    opacity: .65;
  }
  ${props =>
    props.styleType === "BOLD" &&
    `
    font-style: bold;
  `}
  ${props =>
    props.styleType === "ITALIC" &&
    `
    font-style: italic;
  `}
  ${props =>
    props.styleType === "STRIKETHROUGH" &&
    `
    text-decoration: line-through;
  `}
  ${props =>
    props.styleType === "UNDERLINE" &&
    `
    text-decoration: underline;
  `}
`

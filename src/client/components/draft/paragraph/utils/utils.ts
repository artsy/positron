import {
  EditorState,
  getDefaultKeyBinding,
  KeyBindingUtil,
  Modifier,
} from "draft-js"
import Immutable from "immutable"
import { map } from "lodash"
import React from "react"
import { getSelectionDetails } from "../../../rich_text/utils/text_selection"
import { AllowedStylesParagraph, StyleMap } from "../../typings"

/**
 * Helpers for draft-js Paragraph component setup
 */

/**
 * blockRenderMap determines how HTML blocks are rendered in
 * draft's Editor component. 'unstyled' is equivalent to <p>.
 *
 * Element is 'div' because draft nests <div> tags with text,
 * and <p> tags cannot have nested children.
 */
export const blockRenderMap = Immutable.Map({
  unstyled: {
    element: "div",
  },
})

/**
 * Default allowedStyles for Paragraph component
 */
export const paragraphStyleMap: StyleMap = [
  { element: "B", name: "BOLD" },
  { element: "I", name: "ITALIC" },
]

/**
 * Returns styleMap from nodeNames
 * Used to attach node-names to props.allowedStyles
 */
export const styleMapFromNodes = (
  allowedStyles: AllowedStylesParagraph = ["B", "I"]
) => {
  const styleMap: StyleMap = []

  allowedStyles.map(style => {
    switch (style.toUpperCase()) {
      case "B":
      case "BOLD": {
        styleMap.push({ element: "B", name: "BOLD" })
        break
      }
      case "I":
      case "ITALIC": {
        styleMap.push({ element: "I", name: "ITALIC" })
        break
      }
    }
  })
  return styleMap
}

/**
 * Returns the names of allowed styles
 * Used for key commands, TextNav, and draft-convert
 */
export const styleNamesFromMap = (styles: StyleMap = paragraphStyleMap) => {
  return map(styles, "name")
}

/**
 * Returns the nodeNames for allowed styles
 * Used for draft-convert
 */
export const styleNodesFromMap = (styles: StyleMap = paragraphStyleMap) => {
  return map(styles, "element")
}

/**
 * Extend keybindings to open link input
 */
export const keyBindingFn = (e: React.KeyboardEvent<{}>) => {
  if (KeyBindingUtil.hasCommandModifier(e) && e.keyCode === 75) {
    // command + k
    return "link-prompt"
  } else {
    // Use draft or browser default handling
    return getDefaultKeyBinding(e)
  }
}

/**
 * Prevents consecutive empty paragraphs
 */
export const handleReturn = (
  e: React.KeyboardEvent<{}>,
  editorState: EditorState
) => {
  const { anchorOffset, isFirstBlock } = getSelectionDetails(editorState)

  if (isFirstBlock || anchorOffset) {
    // If first block, no chance of empty block before
    // If anchor offset, the block is not empty
    return "not-handled"
  } else {
    // Return handled to avoid creating empty blocks
    e.preventDefault()
    return "handled"
  }
}

/**
 * Merges a state created from pasted text into editorState
 */
export const insertPastedState = (
  pastedState: EditorState,
  editorState: EditorState
) => {
  const blockMap = pastedState.getCurrentContent().getBlockMap()

  // Merge blockMap from pasted text into existing content
  const modifiedContent = Modifier.replaceWithFragment(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    blockMap
  )
  // Create a new editorState from merged content
  return EditorState.push(editorState, modifiedContent, "insert-fragment")
}

import {
  EditorState,
  getDefaultKeyBinding,
  KeyBindingUtil,
  Modifier,
  RichUtils,
} from "draft-js"
import Immutable from "immutable"
import React from "react"
import { draftDefaultStyles } from "../../shared/shared"
import { AllowedBlocks, AllowedStyles, StyleMap } from "../../typings"

/**
 * Helpers for draft-js RichText component
 */

/**
 * Default allowedBlocks for RichText component
 */
export const richTextBlockRenderMap = Immutable.Map({
  "header-two": {
    element: "h2",
  },
  "header-three": {
    element: "h3",
  },
  blockquote: {
    element: "blockquote",
  },
  "unordered-list-item": {
    element: "li",
  },
  "ordered-list-item": {
    element: "li",
  },
  unstyled: {
    element: "div",
  },
})

/**
 * Default allowedStyles for RichText component
 */
export const richTextStyleMap: StyleMap = [
  { element: "B", name: "BOLD" },
  { element: "I", name: "ITALIC" },
  { element: "U", name: "UNDERLINE" },
  { element: "S", name: "STRIKETHROUGH" },
]

/**
 * Default allowedBlock elements for RichText component
 */
export const richTextBlockElements: AllowedBlocks = [
  "h2",
  "h3",
  "blockquote",
  "ul",
  "ol",
  "p",
]

/**
 * Default allowedStyle elements for RichText component
 */
export const richTextStyleElements: AllowedStyles = ["B", "I", "S"]

/**
 * Returns blockMap from element names
 * Used to generate blockMap from props.allowedBlocks
 */
export const blockMapFromNodes = (allowedBlocks: AllowedBlocks = ["p"]) => {
  const blockMap: any = []

  allowedBlocks.map(block => {
    switch (block) {
      case "h1": {
        blockMap.push({ name: "header-one", element: "h1" })
        break
      }
      case "h2": {
        blockMap.push({ name: "header-two", element: "h2" })
        break
      }
      case "h3": {
        blockMap.push({ name: "header-three", element: "h3" })
        break
      }
      case "blockquote": {
        blockMap.push({ name: "blockquote", element: "blockquote" })
        break
      }
      case "ul": {
        blockMap.push({ name: "unordered-list-item", element: "li" })
        break
      }
      case "ol": {
        blockMap.push({ name: "ordered-list-item", element: "li" })
        break
      }
      case "p": {
        blockMap.push({ name: "unstyled", element: "div" })
        break
      }
    }
  })

  const blocksToImmutableMap = blockMap.reduce((obj, block) => {
    return obj.set(block.name, {
      element: block.element,
    })
  }, Immutable.Map())

  return blocksToImmutableMap
}

/**
 * Extend keybindings
 */
export const keyBindingFn = (e: React.KeyboardEvent<{}>) => {
  // Custom key commands for full editor
  if (KeyBindingUtil.hasCommandModifier(e)) {
    switch (e.keyCode) {
      case 49:
        // command + 1
        return "header-one"
      case 50:
        // command + 2
        return "header-two"
      case 51:
        // command + 3
        return "header-three"
      case 191:
        // command + /
        return "plain-text"
      case 55:
        // command + 7
        return "ordered-list-item"
      case 56:
        // command + 8
        return "unordered-list-item"
      case 75:
        // command + k
        return "link-prompt"
      case 219:
        // command + [
        return "blockquote"
      case 88:
        // command + shift + X
        if (e.shiftKey) {
          return "strikethrough"
        }
      default:
        return getDefaultKeyBinding(e)
    }
  }
  return getDefaultKeyBinding(e)
}

export const makePlainText = (editorState: EditorState) => {
  // Remove links
  const editorStateWithoutLinks = removeLinks(editorState)
  // Remove inline styles
  const editorStateWithoutStyles = removeInlineStyles(editorStateWithoutLinks)
  // Remove blocks from selection
  const contentStateWithoutBlocks = removeBlocks(editorStateWithoutStyles)
  // Merge existing and stripped states
  return EditorState.push(
    editorState,
    contentStateWithoutBlocks,
    "change-inline-style"
  )
}

/**
 * Strips all inline styles from selected text
 */
export const removeInlineStyles = (editorState: EditorState) => {
  let contentState = editorState.getCurrentContent()
  draftDefaultStyles.forEach((style: string) => {
    contentState = Modifier.removeInlineStyle(
      contentState,
      editorState.getSelection(),
      style
    )
  })
  return EditorState.push(editorState, contentState, "change-inline-style")
}

/**
 * Strips link entities from selected text
 */
export const removeLinks = (editorState: EditorState) => {
  return RichUtils.toggleLink(editorState, editorState.getSelection(), null)
}

/**
 * Strips blocks from selected text
 */
export const removeBlocks = (editorState: EditorState) => {
  return Modifier.setBlockType(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    "unstyled"
  )
}

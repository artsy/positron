import { getDefaultKeyBinding, KeyBindingUtil } from "draft-js"
import Immutable from "immutable"
import React from "react"
import { StyleElements, StyleMap } from "../../typings"

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
 * Default allowed StyleMap  for Paragraph component
 */
export const paragraphStyleMap: StyleMap = [
  { element: "B", name: "BOLD" },
  { element: "I", name: "ITALIC" },
]

/**
 * Default allowedStyles for Paragraph component
 */
export const allowedStylesParagraph: StyleElements[] = ["B", "I"]

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

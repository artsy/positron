import Immutable from "immutable"
import { StyleMap } from "../../typings"

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

import { map } from 'lodash'
import {
  getDefaultKeyBinding,
  EditorState,
  KeyBindingUtil,
  Modifier
} from 'draft-js'
import Immutable from 'immutable'
import { getSelectionDetails } from 'client/components/rich_text/utils/text_selection'

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
  'unstyled': {
    element: 'div'
  }
})

/**
 * Default allowedStyles for Paragraph component
 */
const paragraphStyleMap = [
  {label: 'B', name: 'BOLD'},
  {label: 'I', name: 'ITALIC'}
]

/**
 * Returns styleMap from nodeNames
 * Used to attach node-names to props.allowedStyles
 */
export const styleMapFromNodes = (allowedStyles = ['B', 'I']) => {
  let styleMap = []

  allowedStyles.map(style => {
    switch (style.toUpperCase()) {
      case 'B':
      case 'BOLD': {
        styleMap.push(
          {label: 'B', name: 'BOLD'}
        )
        break
      }
      case 'I':
      case 'ITALIC': {
        styleMap.push(
          {label: 'I', name: 'ITALIC'}
        )
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
export const styleNamesFromMap = (styles = paragraphStyleMap) => {
  return map(styles, 'name')
}

/**
 * Returns the nodeNames for allowed styles
 * Used for draft-convert
 */
export const styleNodesFromMap = (styles = paragraphStyleMap) => {
  return map(styles, 'label')
}

/**
 * Extend keybindings to open link input
 */
export const keyBindingFn = e => {
  if (KeyBindingUtil.hasCommandModifier(e) && e.keyCode === 75) {
    // command + k
    return 'link-prompt'
  } else {
    // Use draft or browser default handling
    return getDefaultKeyBinding(e)
  }
}

/**
 * Prevents consecutive empty paragraphs
 */
export const handleReturn = (e, editorState) => {
  const {
    anchorOffset,
    isFirstBlock
  } = getSelectionDetails(editorState)

  if (isFirstBlock || anchorOffset) {
    // If first block, no chance of empty block before
    // If anchor offset, the block is not empty
    return 'not-handled'
  } else {
    // Return handled to avoid creating empty blocks
    e.preventDefault()
    return 'handled'
  }
}

/**
 * Merges a state created from pasted text into editorState
 */
export const insertPastedState = (pastedState, editorState) => {
  const blockMap = pastedState.getCurrentContent().blockMap

  // Merge blockMap from pasted text into existing content
  const modifiedContent = Modifier.replaceWithFragment(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    blockMap
  )
  // Create a new editorState from merged content
  return EditorState.push(
    editorState, modifiedContent, 'insert-fragment'
  )
}

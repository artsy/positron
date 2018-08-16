import { map } from 'lodash'
import {
  getDefaultKeyBinding,
  EditorState,
  KeyBindingUtil,
  Modifier
} from 'draft-js'
import Immutable from 'immutable'
import { getSelectionDetails } from 'client/components/rich_text/utils/text_selection'

export const blockRenderMap = Immutable.Map({
  /**
   * blockRenderMap determines how HTML blocks are rendered in
   * draft's Editor component. 'unstyled' is equivalent to <p>.
   *
   * Element is 'div' because draft nests <div> tags with text,
   * and <p> tags cannot have nested children.
  */
  'unstyled': {
    element: 'div'
  }
})

const paragraphStyleMap = [
  /**
   * Default allowedStyles for Paragraph component
   */
  {label: 'B', name: 'BOLD'},
  {label: 'I', name: 'ITALIC'}
]

export const styleMapFromNodes = (allowedStyles = ['B', 'I']) => {
  /**
   * Returns styleMap from nodeNames
   * Used to attach node-names to props.allowedStyles
   */
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

export const styleNamesFromMap = (styles = paragraphStyleMap) => {
  /**
   * Returns the names of allowed styles
   * Used for key commands, TextNav, and draft-convert
   */
  return map(styles, 'name')
}

export const styleNodesFromMap = (styles = paragraphStyleMap) => {
  /**
   * Returns the nodeNames for allowed styles
   * Used for draft-convert
   */
  return map(styles, 'label')
}

export const keyBindingFn = e => {
  /**
   * Extend keybindings to open link input
   */
  if (KeyBindingUtil.hasCommandModifier(e) && e.keyCode === 75) {
    // command + k
    return 'link-prompt'
  } else {
    // Use draft or browser default handling
    return getDefaultKeyBinding(e)
  }
}

export const handleReturn = (e, editorState) => {
  /**
   * Prevents consecutive empty paragraphs
   */
  const {
    anchorOffset,
    isFirstBlock
  } = getSelectionDetails(editorState)

  if (isFirstBlock || anchorOffset) {
    /**
     * If first block, no chance of empty block before
     * If anchor offset, the block is not empty
     */
    return 'not-handled'
  } else {
    // Return handled to avoid creating empty blocks
    e.preventDefault()
    return 'handled'
  }
}

export const insertPastedState = (pastedState, editorState) => {
  /**
   * Merges a state created from pasted text into editorState
   */
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

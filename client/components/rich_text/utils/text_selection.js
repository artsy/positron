import {
  EditorState,
  getVisibleSelectionRect,
  SelectionState
} from 'draft-js'

export const getSelectedLinkData = (editorState) => {
  // Return attrs of selected link element
  let className = ''
  let key
  let url = ''

  const content = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  const anchorKey = selection.getStartKey()
  const anchorBlock = content.getBlockForKey(anchorKey)

  if (anchorBlock) {
    key = anchorBlock.getEntityAt(selection.getStartOffset())
    if (key) {
      const link = content.getEntity(key)
      url = link.getData().url
      className = link.getData().className
    }
  }
  return { url, key, className }
}

export const getSelectionLocation = (editorPosition) => {
  // get x/y location of currently selected text
  let target = getVisibleSelectionRect(window)
  const parent = {
    top: editorPosition.top - window.pageYOffset,
    left: editorPosition.left
  }

  return { target, parent }
}

export const setSelectionToStart = (editorState) => {
  // Move cursor to first character of first block
  const firstKey = editorState.getCurrentContent().getFirstBlock().getKey()
  const newSelection = new SelectionState({
    anchorKey: firstKey,
    anchorOffset: 0,
    focusKey: firstKey,
    focusOffset: 0
  })
  return EditorState.forceSelection(editorState, newSelection)
}

export const stickyControlsBox = (editorPosition, fromTop, fromLeft) => {
  // Get position of pop-up controls from on parent and selection location
  const { target, parent } = exports.getSelectionLocation(editorPosition)
  const top = target.top - parent.top + fromTop
  const left = target.left - parent.left + (target.width / 2) - fromLeft

  return { top, left }
}

export const getSelectionDetails = (editorState) => {
  // Returns some commonly used selection attrs
  const selection = editorState.getSelection()
  const content = editorState.getCurrentContent()

  const anchorKey = selection.getAnchorKey()
  const anchorOffset = selection.getAnchorOffset()
  const anchorBlock = content.getBlockForKey(anchorKey)
  const anchorType = anchorBlock.getType()

  const beforeKey = content.getKeyBefore(anchorKey)
  const blockBefore = content.getBlockForKey(beforeKey)

  const isFirstBlock = !blockBefore
  const isFirstCharacter = selection.getStartOffset() === 0
  const isLastBlock = content.getLastBlock().getKey() === anchorKey
  const isLastCharacter = selection.getStartOffset() === anchorBlock.getLength()

  return {
    anchorKey,
    anchorOffset,
    anchorType,
    isFirstBlock,
    isFirstCharacter,
    isLastBlock,
    isLastCharacter
  }
}

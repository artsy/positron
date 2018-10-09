import ReactDOM from "react-dom"
import { clone } from "lodash"
import {
  ContentState,
  EditorState,
  getVisibleSelectionRect,
  RichUtils,
  SelectionState,
} from "draft-js"
import {
  convertFromRichHtml,
  convertToRichHtml,
} from "client/components/rich_text/utils/convert_html"

export const getSelectedLinkData = editorState => {
  // Return attrs of selected link element
  let className
  let key
  let url = ""

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

export const setSelectionToStart = editorState => {
  // Move cursor to first character of first block
  const firstKey = editorState
    .getCurrentContent()
    .getFirstBlock()
    .getKey()
  const newSelection = new SelectionState({
    anchorKey: firstKey,
    anchorOffset: 0,
    focusKey: firstKey,
    focusOffset: 0,
  })
  return EditorState.forceSelection(editorState, newSelection)
}

export const stickyControlsBox = (editorPosition, fromTop, fromLeft) => {
  // Get position of pop-up controls from selection and parent location
  const target = getVisibleSelectionRect(window)
  const top = target.top - editorPosition.top + fromTop
  const left = target.left - editorPosition.left + target.width / 2 - fromLeft

  return { top, left }
}

export const getSelectionDetails = editorState => {
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
    isLastCharacter,
  }
}

export const mergeHtmlIntoState = (editorState, beforeHtml, afterHtml) => {
  const combinedHtml = beforeHtml + afterHtml
  const combinedBlocks = convertFromRichHtml(combinedHtml)

  const newState = EditorState.push(editorState, combinedBlocks, null)
  const stateWithFocus = setSelectionToStart(newState)

  return stateWithFocus
}

export const divideEditorState = (editorState, anchorKey, layout) => {
  const blockArray = editorState.getCurrentContent().getBlocksAsArray()
  let beforeBlocks
  let afterBlocks

  blockArray.map((block, index) => {
    if (block.getKey() === anchorKey) {
      // split blocks at end of selected block
      beforeBlocks = blockArray.splice(0, index)
      afterBlocks = clone(blockArray)
    }
  })
  if (beforeBlocks) {
    const beforeContent = ContentState.createFromBlockArray(beforeBlocks)
    const currentSectionState = EditorState.push(
      editorState,
      beforeContent,
      "remove-range"
    )
    const afterContent = ContentState.createFromBlockArray(afterBlocks)
    const afterState = EditorState.push(editorState, afterContent, null)
    const newSection = convertToRichHtml(afterState, layout)

    return {
      currentSectionState,
      newSection,
    }
  }
}

export const addLinkToState = (editorState, url, plugin) => {
  const contentState = editorState.getCurrentContent()
  const linkData = { url }

  if (plugin) {
    linkData.className = "is-follow-link"
  }

  const contentWithLink = contentState.createEntity("LINK", "MUTABLE", linkData)
  const entityKey = contentWithLink.getLastCreatedEntityKey()
  const editorStateWithEntity = EditorState.set(editorState, {
    currentContent: contentWithLink,
  })
  const editorStateWithLink = RichUtils.toggleLink(
    editorStateWithEntity,
    editorStateWithEntity.getSelection(),
    entityKey
  )

  return editorStateWithLink
}

export const hasSelection = editorState => {
  const windowHasSelection = !window.getSelection().isCollapsed
  const editorHasSelection = !editorState.getSelection().isCollapsed()

  return windowHasSelection || editorHasSelection
}

export const getMenuSelectionTarget = (editorRef, editorState, hasFeatures) => {
  if (hasSelection(editorState)) {
    const editor = ReactDOM.findDOMNode(editorRef)
    const editorPosition = editor.getBoundingClientRect()
    const selectionLeft = hasFeatures ? 125 : 100
    const selectionTarget = stickyControlsBox(
      editorPosition,
      -93,
      selectionLeft
    )

    return selectionTarget
  }
}

export const getLinkSelectionTarget = (editorRef, editorState) => {
  if (hasSelection(editorState)) {
    const editor = ReactDOM.findDOMNode(editorRef)
    const editorPosition = editor.getBoundingClientRect()
    const selectionTarget = stickyControlsBox(editorPosition, 25, 200)

    return selectionTarget
  }
}

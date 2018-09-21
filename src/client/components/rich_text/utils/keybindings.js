import { getDefaultKeyBinding, KeyBindingUtil } from "draft-js"
import { getFormattedState } from "./convert_html"
import { getSelectionDetails, mergeHtmlIntoState } from "./text_selection"
import { stripBlockquote } from "./text_stripping"

export const keyBindingFnFull = e => {
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
        return "custom-clear"
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
    }
  }
  return getDefaultKeyBinding(e)
}

export const keyBindingFnParagraph = e => {
  // Custom key commands for paragraph editor
  if (KeyBindingUtil.hasCommandModifier(e) && e.keyCode === 75) {
    return "link-prompt"
  } else {
    return getDefaultKeyBinding(e)
  }
}

export const handleChangeSection = (
  editorState,
  key,
  index,
  onChangeSection
) => {
  // if cursor is arrow forward from last character of last block
  // or cursor is arrow back from first character of first block
  // jump to adjacent section
  let direction = 0
  if (["ArrowUp", "ArrowLeft"].includes(key)) {
    direction = -1
  } else if (["ArrowDown", "ArrowRight"].includes(key)) {
    direction = 1
  }

  const selection = getSelectionDetails(editorState)
  const {
    isFirstBlock,
    isFirstCharacter,
    isLastBlock,
    isLastCharacter,
  } = selection
  const isFirst = isFirstBlock && isFirstCharacter && direction === -1
  const isLast = isLastBlock && isLastCharacter && direction === 1

  if (isFirst || isLast) {
    onChangeSection(index + direction)
  }
}

export const handleReturn = (e, editorState, maybeSplitSection) => {
  // Maybe divide content into 2 text sections at cursor on return
  const { anchorKey, anchorOffset, isFirstBlock } = getSelectionDetails(
    editorState
  )
  // Don't split from the first block, to avoid creating empty blocks
  // Don't split from the middle of a paragraph
  if (isFirstBlock || anchorOffset) {
    return "not-handled"
  } else {
    e.preventDefault()
    maybeSplitSection(anchorKey)
    return "handled"
  }
}

export const handleTab = (e, index, onSetEditing) => {
  // For jumping to next or previous section

  // by default, jump to next section
  let newIndex = index + 1

  if (e.shiftKey && index !== 0) {
    // shift-tab to previous section
    newIndex = index - 1
  }

  e.preventDefault()
  onSetEditing(newIndex)
}

export const onPaste = (e, editorState, layout, hasFeatures) => {
  const { text, html } = e

  const formattedHtml = html || "<div>" + text + "</div>"
  const newState = getFormattedState(
    editorState,
    formattedHtml,
    layout,
    hasFeatures,
    true
  ).editorState

  return newState
}

export const handleBackspace = (editorState, html, sectionBefore) => {
  const selection = getSelectionDetails(editorState)
  const { isFirstBlock, anchorOffset } = selection

  const sectionBeforeIsText = sectionBefore && sectionBefore.type === "text"
  const isAtFirstCharacter = anchorOffset === 0

  // only merge a section if focus is at 1st character of 1st block
  if (isFirstBlock && isAtFirstCharacter && sectionBeforeIsText) {
    const beforeHtml = sectionBefore.body
    // merge html from both sections into new state
    const newState = mergeHtmlIntoState(
      editorState,
      stripBlockquote(beforeHtml),
      stripBlockquote(html)
    )
    return newState
  }
}

import { EditorState } from "draft-js"

export const getSelectionDetails = (editorState: EditorState) => {
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

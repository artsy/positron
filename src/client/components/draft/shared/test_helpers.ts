import {
  convertDraftToHtml,
  convertHtmlToDraft,
} from "client/components/draft/rich_text/utils/convert"
import {
  richTextBlockRenderMap,
  richTextStyleMap,
} from "client/components/draft/rich_text/utils/utils"
import { decorators } from "client/components/draft/shared/decorators"
import Draft, { EditorState } from "draft-js"

export const htmlWithRichBlocks = `
  <meta><title>Page Title</title></meta>
  <script>do a bad thing</script>
  <p><a href="https://artsy.net">a link</a></p>
  <p></p>
  <h1>an h1</h1>
  <h2>an h2</h2>
  <h3>an h3</h3>
  <h4>an h4</h4>
  <h5>an h5</h5>
  <h6>an h6</h6>
  <ul><li>unordered list</li><li>second list item</li></ul>
  <ol><li>ordered list</li></ol>
  <blockquote>a blockquote</blockquote>
`

export const htmlWithDisallowedStyles = `
  <p><del>Strikethrough text</del>
  <code>Code text</code>
  <u>Underline text</u>
  <em>Italic text</em>
  <i>Italic text</i>
  <strong>Bold text</strong>
  <b>Bold text</b></p>
`

export const getContentState = (
  html,
  hasLinks = true,
  blockMap = richTextBlockRenderMap
) => {
  return convertHtmlToDraft(html, hasLinks, blockMap, richTextStyleMap)
}

export const getHtmlViaContentState = (
  html: string,
  hasLinks = false,
  hasFollowButton = false
) => {
  // Get unstripped content state
  const contentState = getContentState(html, hasLinks, richTextBlockRenderMap)
  // Convert contentState back to html
  return convertDraftToHtml(
    contentState,
    richTextBlockRenderMap,
    richTextStyleMap,
    hasFollowButton
  )
}

export const getEditorState = (
  html,
  hasLinks = true,
  blockMap = richTextBlockRenderMap
) => {
  const contentState = getContentState(html, hasLinks, blockMap)
  return EditorState.createWithContent(contentState, decorators(hasLinks))
}

export const getStateAsHtml = editorState => {
  return convertDraftToHtml(
    editorState.getCurrentContent(),
    richTextBlockRenderMap,
    richTextStyleMap
  )
}

export const applySelectionToEditorState = (
  editorState,
  anchorOffset: number = 0
) => {
  const startSelection = editorState.getSelection()
  const startEditorState = editorState.getCurrentContent()
  const { key, text } = startEditorState.getFirstBlock()
  const selection = startSelection.merge({
    anchorKey: key,
    anchorOffset,
    focusKey: key,
    focusOffset: text.length,
  })
  const newEditorState = Draft.EditorState.acceptSelection(
    editorState,
    selection
  )
  return newEditorState
}

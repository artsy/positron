import { convertFromHTML, convertToHTML } from "draft-convert"
import { EditorState } from "draft-js"
import { entityToHTML, htmlToEntity } from "../convert"
import { decorators } from "../decorators"
import { confirmLink, linkDataFromSelection, removeLink } from "../links"

describe("Links", () => {
  const htmlWithLink = '<p><a href="https://artsy.net">a link</a></p>'
  const plainHtml = "<p>a link</p>"

  const getEditorState = (html: any, hasSelection = true) => {
    const currentContent = convertFromHTML({ htmlToEntity })(html)

    const editorState = EditorState.createWithContent(
      currentContent,
      decorators(true)
    )
    if (hasSelection) {
      return applySelection(editorState)
    } else {
      return editorState
    }
  }

  const applySelection = editorState => {
    const startSelection = editorState.getSelection()
    const startEditorState = editorState.getCurrentContent()
    const { key, text } = startEditorState.getFirstBlock()

    const selection = startSelection.merge({
      anchorKey: key,
      anchorOffset: 0,
      focusKey: key,
      focusOffset: text.length,
      hasFocus: true,
    })
    return EditorState.acceptSelection(editorState, selection)
  }

  describe("#confirmLink", () => {
    it("Inserts a link at text selection", () => {
      const editorState = getEditorState(plainHtml)
      const newState = confirmLink("https://artsy.net", editorState)
      const newContent = newState.getCurrentContent()
      const entityKey = newContent.getLastCreatedEntityKey()
      const entity = newContent.getEntity(entityKey)

      expect(entity.getType()).toBe("LINK")
      expect(entity.getData().url).toBe("https://artsy.net")
    })
  })

  describe("#removeLink", () => {
    it("Removes a link at text selection", () => {
      const editorState = getEditorState(htmlWithLink)
      const newState = removeLink(editorState)
      const newContent = newState && newState.getCurrentContent()
      const newHtml = convertToHTML({ entityToHTML })(newContent)

      expect(newHtml).toBe("<p>a link</p>")
    })

    it("Returns false if no selection", () => {
      const editorState = getEditorState(htmlWithLink, false)
      const newState = removeLink(editorState)

      expect(newState).toBe(false)
    })
  })

  describe("#linkDataFromSelection", () => {
    it("Returns link data from text selection", () => {
      const editorState = getEditorState(htmlWithLink)
      const linkData = linkDataFromSelection(editorState)

      expect(linkData.url).toBe("https://artsy.net/")
    })

    it("Returns empty string if no link", () => {
      const editorState = getEditorState(plainHtml, false)
      const linkData = linkDataFromSelection(editorState)

      expect(linkData).toBe("")
    })
  })
})

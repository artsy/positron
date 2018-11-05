import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import Draft from "draft-js"
import { convertHtmlToDraft } from "../../paragraph/utils/convert"
import { StyleMap } from "../../typings"
import { getSelectionDetails } from "../selection"

describe("Draft Utils: Text Selection", () => {
  let lastBlock

  describe("#getSelectionDetails", () => {
    const { sections } = StandardArticle
    const sectionBody: string = sections ? (sections[0].body as string) : ""
    const editorContent = convertHtmlToDraft(sectionBody, false, [] as StyleMap)
    let editorState = Draft.EditorState.createWithContent(editorContent)
    lastBlock = editorState.getCurrentContent().getLastBlock()

    it("Knows if selection focus is in first block", () => {
      const selection = getSelectionDetails(editorState)
      expect(selection.isFirstBlock).toBe(true)
      expect(selection.isLastBlock).toBe(false)
    })

    it("Knows if selection focus is in first character of block", () => {
      const selection = getSelectionDetails(editorState)
      expect(selection.isFirstCharacter).toBe(true)
      expect(selection.isLastCharacter).toBe(false)
      expect(selection.anchorOffset).toBe(0)
    })

    it("Knows if selection focus is in last block", () => {
      // Set the selection to last block
      const newSelection = editorState.getSelection().merge({
        anchorKey: lastBlock.key,
        anchorOffset: lastBlock.getLength() - 3,
        focusKey: lastBlock.key,
        focusOffset: lastBlock.getLength(),
      })
      editorState = Draft.EditorState.acceptSelection(
        editorState,
        newSelection as any
      )

      const selection = getSelectionDetails(editorState)
      expect(selection.isLastBlock).toBe(true)
      expect(selection.isFirstBlock).toBe(false)
    })

    it("Knows if selection focus is in last character of block", () => {
      // Set the selection to end of last block
      const newSelection = editorState.getSelection().merge({
        anchorOffset: lastBlock.getLength(),
      })
      editorState = Draft.EditorState.acceptSelection(
        editorState,
        newSelection as any
      )

      const selection = getSelectionDetails(editorState)
      expect(selection.isLastCharacter).toBe(true)
      expect(selection.isFirstCharacter).toBe(false)
      expect(selection.anchorOffset).toBe(lastBlock.getLength())
    })
  })
})

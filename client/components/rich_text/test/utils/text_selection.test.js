import {
  getSelectionDetails,
  getSelectionLocation,
  setSelectionToStart,
  stickyControlsBox
} from '../../utils/text_selection.js'

import {
  convertFromRichHtml
} from '../../utils/index.coffee'

import {
  Fixtures
} from '@artsy/reaction-force/dist/Components/Publishing'

jest.unmock('draft-js')
const Draft = require.requireActual('draft-js')

describe('Draft Utils: Text Selection', () => {
  window.pageYOffset = 500

  describe('#getSelectionDetails', () => {
    const editorContent = convertFromRichHtml(Fixtures.StandardArticle.sections[0].body)
    let editorState = Draft.EditorState.createWithContent(editorContent)
    const lastBlock = editorState.getCurrentContent().getLastBlock()

    it('Knows if selection focus is in first block', () => {
      const selection = getSelectionDetails(editorState)
      expect(selection.isFirstBlock).toBe(true)
      expect(selection.isLastBlock).toBe(false)
    })

    it('Knows if selection focus is in first character of block', () => {
      const selection = getSelectionDetails(editorState)
      expect(selection.isFirstCharacter).toBe(true)
      expect(selection.isLastCharacter).toBe(false)
      expect(selection.anchorOffset).toBe(0)
    })

    it('Knows if selection focus is in last block', () => {
      // Set the selection to last block
      const newSelection = editorState.getSelection().merge({
        anchorKey: lastBlock.key,
        anchorOffset: lastBlock.getLength() - 3,
        focusKey: lastBlock.key,
        focusOffset: lastBlock.getLength()
      })
      editorState = Draft.EditorState.acceptSelection(editorState, newSelection)

      const selection = getSelectionDetails(editorState)
      expect(selection.isLastBlock).toBe(true)
      expect(selection.isFirstBlock).toBe(false)
    })

    it('Knows if selection focus is in last character of block', () => {
      // Set the selection to end of last block
      const newSelection = editorState.getSelection().merge({
        anchorOffset: lastBlock.getLength()
      })
      editorState = Draft.EditorState.acceptSelection(editorState, newSelection)

      const selection = getSelectionDetails(editorState)
      expect(selection.isLastCharacter).toBe(true)
      expect(selection.isFirstCharacter).toBe(false)
      expect(selection.anchorOffset).toBe(lastBlock.getLength())
    })
  })

  describe('#getSelectionLocation', () => {
    it('Returns coordinates of the selection and its parent', () => {
      const selection = {
        bottom: 170,
        height: 25,
        left: 425,
        right: 525,
        top: 145,
        width: 95
      }
      Draft.getVisibleSelectionRect = jest.fn().mockReturnValue(selection)
      const location = getSelectionLocation({top: 520, left: 50})

      expect(location.target).toBe(selection)
      expect(location.parent.top).toBe(20)
      expect(location.parent.left).toBe(50)
    })
  })

  describe('#stickyControlsBox', () => {
    it('Returns coordinates of the sticky item', () => {
      const position = stickyControlsBox({top: 520, left: 50}, 50, 100)
      expect(position.top).toBe(175)
      expect(position.left).toBe(322.5)
    })
  })

  describe('#setSelectionToStart', () => {
    // Create an editor state with content
    const editorContent = convertFromRichHtml(Fixtures.StandardArticle.sections[0].body)
    let editorState = Draft.EditorState.createWithContent(editorContent)
    const firstBlock = editorState.getCurrentContent().getFirstBlock()

    // Set the selection at end of block
    const selection = editorState.getSelection().merge({
      anchorKey: firstBlock.key,
      anchorOffset: firstBlock.getLength(),
      focusKey: firstBlock.key,
      focusOffset: firstBlock.getLength()
    })
    editorState = Draft.EditorState.acceptSelection(editorState, selection)

    it('Moves cursor to first character of first block', () => {
      expect(editorState.getSelection().anchorOffset).toBe(65)
      editorState = setSelectionToStart(editorState)
      expect(editorState.getSelection().anchorOffset).toBe(0)
    })
  })
})

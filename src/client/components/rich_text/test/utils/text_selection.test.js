import {
  addLinkToState,
  divideEditorState,
  getSelectionDetails,
  setSelectionToStart,
  mergeHtmlIntoState,
  stickyControlsBox
} from '../../utils/text_selection'
import { decorators } from '../../utils/config'
import { convertFromRichHtml, convertToRichHtml } from '../../utils/convert_html'
import { StandardArticle } from '@artsy/reaction/dist/Components/Publishing/Fixtures/Articles'
import Draft from 'draft-js'

describe('Draft Utils: Text Selection', () => {
  window.pageYOffset = 500

  describe('#getSelectionDetails', () => {
    const editorContent = convertFromRichHtml(StandardArticle.sections[0].body)
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

  describe('#setSelectionToStart', () => {
    // Create an editor state with content
    const editorContent = convertFromRichHtml(StandardArticle.sections[0].body)
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

  it('#stickyControlsBox Returns coordinates of the sticky item', () => {
    window.pageYOffset = 500
    const getClientRects = jest.fn().mockReturnValue([{
      bottom: 170,
      height: 25,
      left: 425,
      right: 525,
      top: 145,
      width: 95
    }])
    const getRangeAt = jest.fn().mockReturnValue({ getClientRects })

    window.getSelection = jest.fn().mockReturnValue({
      isCollapsed: false,
      getRangeAt
    })
    global.getSelection = jest.fn().mockReturnValue({
      anchorNode: {},
      anchorOffset: 4,
      baseNode: {},
      baseOffset: 4,
      extentNode: {},
      extentOffset: 12,
      focusNode: {},
      focusOffset: 12,
      isCollapsed: false,
      rangeCount: 1,
      type: 'Range',
      getRangeAt
    })

    const position = stickyControlsBox({ top: 20, left: 50 }, 50, 100)

    expect(position.top).toBe(175)
    expect(position.left).toBe(325)
  })

  it('#mergeHtmlIntoState Combines two blocks of HTML into one editorState', () => {
    const editorState = Draft.EditorState.createEmpty()
    const beforeHtml = StandardArticle.sections[0].body
    const afterHtml = StandardArticle.sections[1].body
    const mergedState = mergeHtmlIntoState(editorState, beforeHtml, afterHtml)
    const newText = mergedState.getCurrentContent().getPlainText()

    expect(newText).toMatch('What would Antoine Court de Gébelin think of the Happy Squirrel?')
    expect(newText).toMatch('With works by Franz Ackermann, Ai Weiwei, Pawel Althamer, Billy Childish')
  })

  it('#divideEditorState Divides an editorState into two, returns html for new section', () => {
    const blocksFromHTML = convertFromRichHtml(StandardArticle.sections[0].body)
    const editorState = Draft.EditorState.createWithContent(blocksFromHTML)
    const anchorKey = editorState.getCurrentContent().getLastBlock().key

    const dividedState = divideEditorState(editorState, anchorKey)
    const newStateToHtml = dividedState.currentSectionState.getCurrentContent().getPlainText()

    expect(newStateToHtml).toMatch('What would Antoine Court de Gébelin think of the Happy Squirrel?')
    expect(dividedState.newSection).not.toMatch('What would Antoine Court de Gébelin think of the Happy Squirrel?')

    expect(newStateToHtml).not.toMatch('So what would de Gébelin’s reaction be?')
    expect(dividedState.newSection).toMatch('So what would de Gébelin’s reaction be?')
  })

  it('#addLinkToState Applies a new link entity to editorState at selection', () => {
    const getSelection = (editorState) => {
      const startSelection = editorState.getSelection()
      const startEditorState = editorState.getCurrentContent()
      const { key, text } = startEditorState.getFirstBlock()
      const selection = startSelection.merge({
        anchorKey: key,
        anchorOffset: 0,
        focusKey: key,
        focusOffset: text.length
      })
      const newEditorState = Draft.EditorState.acceptSelection(editorState, selection)
      return newEditorState
    }

    const blocksFromHTML = convertFromRichHtml(StandardArticle.sections[0].body)
    const editorState = Draft.EditorState.createWithContent(
      blocksFromHTML,
      new Draft.CompositeDecorator(decorators(true))
    )
    const editorStateWithSelection = getSelection(editorState)

    const stateWithLink = addLinkToState(editorStateWithSelection, 'http://link.com')
    const htmlWithLink = convertToRichHtml(stateWithLink, 'standard')

    expect(htmlWithLink).toMatch('<a href="http://link.com">')
  })
})

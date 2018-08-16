import { convertFromHTML } from 'draft-convert'
import { EditorState } from 'draft-js'
import {
  confirmLink,
  linkDataFromSelection,
  removeLink
} from '../links'
import { htmlToEntity } from '../convert'
import { decorators } from '../decorators'

describe('Links', () => {
  const htmlWithLink = '<p><a href="https://artsy.net">a link</a></p>'
  const html = '<p>a link</p>'

  const getEditorState = (html, hasSelection = true) => {
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
      hasFocus: true
    })
    return EditorState.acceptSelection(editorState, selection)
  }

  describe('#confirmLink', () => {
    it('Inserts a link at text selection', () => {
      const editorState = getEditorState(html)
      const newState = confirmLink('https://artsy.net', editorState)
      const newContent = newState.getCurrentContent()
      const entityKey = newContent.getLastCreatedEntityKey()
      const entity = newContent.getEntity(entityKey)

      expect(entity.getType()).toBe('LINK')
      expect(entity.getData().url).toBe('https://artsy.net')
    })
  })

  describe('#removeLink', () => {
    it('Removes a link at text selection', () => {
      const editorState = getEditorState(htmlWithLink)
      const newState = removeLink(editorState)

      expect(newState.getCurrentContent()).toBeDefined()
    })

    it('Returns nothing if no selection', () => {
      const editorState = getEditorState(htmlWithLink, false)
      const newState = removeLink(editorState)

      expect(newState).not.toBeDefined()
    })
  })

  describe('#linkDataFromSelection', () => {
    it('Returns link data from text selection', () => {
      const editorState = getEditorState(htmlWithLink)
      const linkData = linkDataFromSelection(editorState)

      expect(linkData.url).toBe('https://artsy.net/')
    })

    it('Returns nothing if no link', () => {
      const editorState = getEditorState(html, false)
      const linkData = linkDataFromSelection(editorState)

      expect(linkData).not.toBeDefined()
    })
  })
})

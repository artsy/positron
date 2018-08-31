import React from 'react'
import { clone } from 'lodash'
import { mount } from 'enzyme'
import { EditorState } from 'draft-js'
import { StandardArticle } from '@artsy/reaction/dist/Components/Publishing/Fixtures/Articles'
import { TextNav } from 'client/components/rich_text/components/text_nav'
import { SectionText } from '../index.jsx'

describe('SectionText', () => {
  let props
  let article
  let getSelection

  const getWrapper = (props) => {
    return mount(
      <SectionText {...props} />
    )
  }

  beforeEach(() => {
    window.scrollTo = jest.fn()
    article = clone(StandardArticle)
    props = {
      article,
      index: 2,
      onChangeSectionAction: jest.fn(),
      newSectionAction: jest.fn(),
      onSetEditing: jest.fn(),
      removeSectionAction: jest.fn(),
      section: clone(article.sections[11]),
      sections: article.sections
    }
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

    // Set up editor with text selection
    getSelection = (getLast) => {
      const component = getWrapper(props)
      const startSelection = component.state().editorState.getSelection()
      const startEditorState = component.state().editorState.getCurrentContent()
      const { key, text } = getLast ? startEditorState.getLastBlock() : startEditorState.getFirstBlock()
      const anchorOffset = getLast ? text.length : 0

      const selection = startSelection.merge({
        anchorKey: key,
        anchorOffset,
        focusKey: key,
        focusOffset: text.length
      })
      const editorState = EditorState.acceptSelection(component.state().editorState, selection)
      return editorState
    }
  })

  describe('Mount and Display', () => {
    it('Converts existing html to an editorState', () => {
      const component = getWrapper(props)
      const content = component.state().editorState.getCurrentContent()

      expect(content.getFirstBlock()).not.toBe(content.getLastBlock())
    })

    it('Converts existing html to an editorState', () => {
      const component = getWrapper(props)
      const text = component.find('.SectionText').text()

      expect(text).toMatch('The Thoth deck,')
    })

    it('Hides the menu when no text selected', () => {
      const component = getWrapper(props)

      expect(component.state().showMenu).toBe(false)
      expect(component.find(TextNav).exists()).toBe(false)
    })

    it('Shows the menu when text is selected', () => {
      const component = getWrapper(props)

      component.find('.SectionText__input').simulate('mouseUp')
      expect(component.state().showMenu).toBe(true)
    })

    it('Converts html onChange with only plugin supported classes', () => {
      props.hasFeatures = true
      props.section.body = '<p class="cool-thing">Cool thing. </p><h2><span><a href="https://www.artsy.net/artist/kow-hiwa" class="is-follow-link">solo show</a><a data-id="kow-hiwa" class="entity-follow artist-follow"></a></span></h2>'
      const component = getWrapper(props)
      component.instance().onChange(component.state().editorState)

      expect(component.state().html).toBe(
        '<p>Cool thing. </p><h2><span><a href="https://www.artsy.net/artist/kow-hiwa" class="is-follow-link">solo show</a><a data-id="kow-hiwa" class="entity-follow artist-follow"></a></span></h2>'
      )
    })

    it('Strips plugin classes from html onChange if hasFeatures is false', () => {
      props.section.body = '<p class="cool-thing">Cool thing. </p><h2><span><a href="https://www.artsy.net/artist/kow-hiwa" class="is-follow-link">solo show</a><a data-id="kow-hiwa" class="entity-follow artist-follow"></a></span></h2>'
      const component = getWrapper(props)
      component.instance().onChange(component.state().editorState)

      expect(component.state().html).toBe(
        '<p>Cool thing. </p><h2><a href="https://www.artsy.net/artist/kow-hiwa">solo show</a></h2>'
      )
    })
  })

  describe('Editorial Features', () => {
    it('Removes end-markers', () => {
      const component = getWrapper(props)

      expect(component.state().html).not.toMatch('class="content-end"')
    })
  })

  describe('#componentDidUpdate', () => {
    it('Calls #maybeResetEditor', () => {
      const component = getWrapper(props)
      component.instance().maybeResetEditor = jest.fn()
      component.instance().componentDidUpdate(props)

      expect(component.instance().maybeResetEditor).toBeCalled()
    })
  })

  describe('#maybeResetEditor', () => {
    it('Calls #setEditorStateFromProps if new body and started editing', () => {
      props.editing = true
      const component = getWrapper(props)
      component.instance().setEditorStateFromProps = jest.fn()
      const prevProps = {
        section: { body: '<p>A text before.</p>', type: 'text' },
        editing: false
      }
      component.instance().maybeResetEditor(prevProps)

      expect(component.instance().setEditorStateFromProps).toBeCalled()
    })

    it('Focuses the editor if started editing and no body change', () => {
      props.editing = true
      const component = getWrapper(props)
      component.instance().focus = jest.fn()
      const prevProps = {
        section: props.section,
        editing: false
      }
      component.instance().maybeResetEditor(prevProps)

      expect(component.instance().focus).toBeCalled()
    })

    it('Blurs the editor if stopped editing', () => {
      props.editing = false
      const component = getWrapper(props)
      component.instance().blur = jest.fn()
      const prevProps = {
        section: props.section,
        editing: true
      }
      component.instance().maybeResetEditor(prevProps)

      expect(component.instance().blur).toBeCalled()
    })
  })

  describe('#toggleBlockQuote', () => {
    it('Can create a blockquote', () => {
      props.hasFeatures = true
      props.section.body = '<p>A blockquote.</p>'
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().focus()
      component.instance().toggleBlock('blockquote')

      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe('body')
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe('<blockquote>A blockquote.</blockquote>')
      expect(props.onChangeSectionAction.mock.calls[1][0]).toBe('layout')
      expect(props.onChangeSectionAction.mock.calls[1][1]).toBe('blockquote')
      expect(props.newSectionAction).not.toBeCalled()
    })

    it('Can create a blockquote with text after', () => {
      props.hasFeatures = true
      props.section.body = '<p>A blockquote.</p><p>A text after.</p>'
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().focus()
      component.instance().toggleBlock('blockquote')

      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe('body')
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe('<blockquote>A blockquote.</blockquote>')
      expect(props.onChangeSectionAction.mock.calls[1][0]).toBe('layout')
      expect(props.onChangeSectionAction.mock.calls[1][1]).toBe('blockquote')
      expect(props.newSectionAction.mock.calls[0][0]).toBe('text')
      expect(props.newSectionAction.mock.calls[0][1]).toBe(props.index + 1)
      expect(props.newSectionAction.mock.calls[0][2].body).toBe('<p>A text after.</p>')
    })

    it('Can create a blockquote with text before', () => {
      props.hasFeatures = true
      props.section.body = '<p>A text before.</p><p>A blockquote.</p>'
      const component = getWrapper(props)
      component.instance().onChange(getSelection(true))
      component.instance().focus()
      component.instance().toggleBlock('blockquote')

      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe('body')
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe('<blockquote>A blockquote.</blockquote>')
      expect(props.onChangeSectionAction.mock.calls[1][0]).toBe('layout')
      expect(props.onChangeSectionAction.mock.calls[1][1]).toBe('blockquote')
      expect(props.newSectionAction.mock.calls[0][0]).toBe('text')
      expect(props.newSectionAction.mock.calls[0][1]).toBe(props.index)
      expect(props.newSectionAction.mock.calls[0][2].body).toBe('<p>A text before.</p>')
    })
  })

  describe('#handleTab', () => {
    it('Jumps to the next section', () => {
      const component = getWrapper(props)
      component.instance().handleTab({
        key: 'tab',
        preventDefault: jest.fn()
      })

      expect(props.onSetEditing.mock.calls[0][0]).toBe(props.index + 1)
    })

    it('If shift key, jumps to the previous section', () => {
      const component = getWrapper(props)
      component.instance().handleTab({
        key: 'tab',
        preventDefault: jest.fn(),
        shiftKey: true
      })

      expect(props.onSetEditing.mock.calls[0][0]).toBe(props.index - 1)
    })
  })

  describe('#handleReturn', () => {
    it('Returns default behaviour if in first block', () => {
      const component = getWrapper(props)
      component.instance().focus()
      const handleReturn = component.instance().handleReturn({ key: 'enter' })

      expect(handleReturn).toBe('not-handled')
    })

    it('Returns default behaviour if in block with content', () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().focus()
      const handleReturn = component.instance().handleReturn({ key: 'enter' })

      expect(handleReturn).toBe('not-handled')
    })

    it('Calls maybeSplitSection if in empty block', () => {
      props.section.body = '<p>hello</p><p><br></p>'
      const component = getWrapper(props)
      component.instance().onChange(getSelection(true))
      component.instance().focus()
      const handleReturn = component.instance().handleReturn({
        key: 'enter',
        preventDefault: jest.fn()
      })

      expect(handleReturn).toBe('handled')
      expect(props.newSectionAction.mock.calls[0][0]).toBe('text')
      expect(props.newSectionAction.mock.calls[0][1]).toBe(props.index + 1)
      expect(props.newSectionAction.mock.calls[0][2].body).toBe('')
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe('body')
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe('<p>hello</p>')
    })
  })

  describe('#handleBackspace', () => {
    it('Returns default behavior if text is selected', () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection(true))
      const handleBackspace = component.instance().handleBackspace()

      expect(handleBackspace).toBe('not-handled')
      expect(props.onSetEditing).not.toBeCalled()
      expect(props.removeSectionAction).not.toBeCalled()
    })

    it('Returns default behavior if section index is 0', () => {
      props.index = 0
      const component = getWrapper(props)
      const handleBackspace = component.instance().handleBackspace()

      expect(handleBackspace).toBe('not-handled')
      expect(props.onSetEditing.mock.calls.length).toBe(0)
      expect(props.removeSectionAction).not.toBeCalled()
    })

    it('Merges section with previous section if at start of block', () => {
      const component = getWrapper(props)
      const handleBackspace = component.instance().handleBackspace()

      expect(handleBackspace).toBe('handled')
      expect(props.removeSectionAction.mock.calls[0][0]).toBe(props.index - 1)
      expect(component.state().html).toMatch(props.section.body)
      expect(component.state().html).toMatch(article.sections[props.index - 1].body)
    })

    it('Calls #onSetEditing with the index of section before', () => {
      const component = getWrapper(props)
      const handleBackspace = component.instance().handleBackspace()

      expect(handleBackspace).toBe('handled')
      expect(props.onSetEditing.mock.calls[0][0]).toBe(props.index - 1)
    })

    it('Removes blockquotes when merging mixed sections', () => {
      props.hasFeatures = true
      props.section.body = '<blockquote>Hello</blockquote>'
      props.section.layout = 'blockquote'
      const component = getWrapper(props)
      const handleBackspace = component.instance().handleBackspace()

      expect(handleBackspace).toBe('handled')
      expect(props.removeSectionAction.mock.calls[0][0]).toBe(props.index - 1)
      expect(component.state().html).toMatch('<p>Hello</p>')
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe('layout')
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBeFalsy()
      expect(component.state().html).toMatch(article.sections[props.index - 1].body)
    })
  })

  describe('#onPaste', () => {
    it('Strips or converts unsupported html and linebreaks', () => {
      const component = getWrapper(props)

      component.instance().onPaste(
        'Here is a caption about an image yep.',
        '<meta><script>bad.stuff()</script><h1 class="stuff">Here is a</h1><ul><li><b>caption</b></li><li>about an <pre>image</pre></li></ul><p>yep.</p><br>'
      )
      expect(component.state().html).toMatch(
        '<p>Here is a</p><ul><li><strong>caption</strong></li><li>about an image</li></ul><p>yep.'
      )
    })

    it('Does not overwrite existing content', () => {
      props.section = article.sections[0]
      const component = getWrapper(props)
      component.instance().onPaste(
        'Here is a caption about an image yep.',
        '<meta><script>bad.stuff()</script><h1 class="stuff">Here is a</h1><ul><li><b>caption</b></li><li>about an <pre>image</pre></li></ul><p>yep.</p><br>'
      )

      expect(component.state().html).toMatch(
        'Here is a</p><ul><li><strong>caption</strong></li><li>about an image</li></ul><p>yep.'
      )
      expect(component.state().html).toMatch('What would Antoine Court de Gébelin think of the Happy Squirrel?')
    })

    it('Strips google inserted styles', () => {
      props.section.body = ''
      const component = getWrapper(props)
      component.instance().onPaste(
        '<b style="font-weight:normal;" id="docs-internal-guid-ce2bb19a-cddb-9e53-cb18-18e71847df4e"><p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Available at: Espacio Valverde • Galleries Sector, Booth 9F01</span></p>'
      )
      expect(component.state().html).toBe('<p>Available at: Espacio Valverde • Galleries Sector, Booth 9F01</p>')
    })

    it('Calls #standardizeSpacing', () => {
      props.section.body = ''
      const badHtml = '<p>Hello.</p><h2></h2><h3></h3><p></p><p></p>'
      const component = getWrapper(props)
      component.instance().onPaste(badHtml)

      expect(component.state().html).toBe('<p>Hello.</p>')
    })
  })

  describe('#handleChangeSection', () => {
    it('R-> Moves the cursor to the next section if at end of block', () => {
      props.section.body = '<p>A text before.</p>'
      const component = getWrapper(props)
      component.instance().onChange(getSelection(true))
      component.instance().handleChangeSection({ key: 'ArrowRight' })

      expect(props.onSetEditing.mock.calls[0][0]).toBe(props.index + 1)
    })

    it('L-> Moves the cursor to the previous section if at start of block', () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleChangeSection({ key: 'ArrowLeft' })

      expect(props.onSetEditing.mock.calls[0][0]).toBe(props.index - 1)
    })

    it('U-> Moves the cursor to the previous section if at start of block', () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleChangeSection({ key: 'ArrowUp' })

      expect(props.onSetEditing.mock.calls[0][0]).toBe(props.index - 1)
    })

    it('D-> Moves the cursor to the next section if at end of block', () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection(true))
      component.instance().focus()
      component.instance().handleChangeSection({ key: 'ArrowDown' })

      expect(props.onSetEditing.mock.calls[0][0]).toBe(props.index + 1)
    })
  })
})

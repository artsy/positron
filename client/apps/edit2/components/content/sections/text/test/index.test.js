import React from 'react'
import { clone } from 'lodash'
import { mount } from 'enzyme'
import { EditorState } from 'draft-js'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Sections from '/client/collections/sections.coffee'
import { TextNav } from 'client/components/rich_text/components/text_nav'
import { SectionText } from '../index.jsx'
const { StandardArticle } = Fixtures

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
      onChange: jest.fn(),
      onSetEditing: jest.fn(),
      section: clone(article.sections[11]),
      sections: new Sections(article.sections)
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
    it('Adds end-marker to a standard article', () => {
      props.isContentEnd = true
      props.hasFeatures = true
      props.section = StandardArticle.sections[0]
      const component = getWrapper(props)

      expect(component.state().html).toMatch('class="content-end"')
    })

    it('Adds end-marker to a feature article', () => {
      props.article.layout = 'feature'
      props.isContentEnd = true
      props.section = StandardArticle.sections[0]
      const component = getWrapper(props)

      expect(component.state().html).toMatch('class="content-end"')
    })

    it('Does not add end-marker to classic articles', () => {
      props.article.layout = 'classic'
      props.isContentEnd = true
      props.section = StandardArticle.sections[0]
      const component = getWrapper(props)

      expect(component.state().html).not.toMatch('class="content-end"')
    })

    it('Does not add end-marker to non-paragraph blocks', () => {
      props.isContentEnd = true
      const component = getWrapper(props)

      expect(component.state().html).not.toMatch('class="content-end"')
    })
  })

  describe('#toggleBlockQuote', () => {
    it('Splits a blockquote into its own text section', () => {
      const originalLength = props.sections.models.length
      props.hasFeatures = true
      props.section.body = '<p>A text before.</p><blockquote>A blockquote.</blockquote><p>A text after.</p>'
      const component = getWrapper(props)
      component.instance().toggleBlockQuote()

      expect(props.onChange.mock.calls[0][0]).toBe('body')
      expect(props.onChange.mock.calls[0][1]).toBe('<blockquote>A blockquote.</blockquote>')
      expect(props.onChange.mock.calls[1][0]).toBe('layout')
      expect(props.onChange.mock.calls[1][1]).toBe('blockquote')
      expect(props.sections.length).toBe(originalLength + 2)
    })

    it('Creates a new section for text before a blockquote', () => {
      const originalLength = props.sections.models.length
      props.hasFeatures = true
      props.section.body = '<p>A text before.</p><blockquote>A blockquote.</blockquote>'
      const component = getWrapper(props)
      component.instance().toggleBlockQuote()
      const newSection = component.props().sections.models[component.props().index]

      expect(props.sections.length).toBe(originalLength + 1)
      expect(newSection.get('body')).toBe('<p>A text before.</p>')
    })

    it('Creates a new section for text after a blockquote', () => {
      const originalLength = props.sections.models.length
      props.hasFeatures = true
      props.section.body = '<blockquote>A blockquote.</blockquote><p>A text after.</p>'
      const component = getWrapper(props)
      component.instance().toggleBlockQuote()
      const newSection = component.props().sections.models[component.props().index + 1]

      expect(props.sections.length).toBe(originalLength + 1)
      expect(newSection.get('body')).toBe('<p>A text after.</p>')
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
      const handleReturn = component.instance().handleReturn({key: 'enter'})

      expect(handleReturn).toBe('not-handled')
    })

    it('Returns default behaviour if in block with content', () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().focus()
      const handleReturn = component.instance().handleReturn({key: 'enter'})

      expect(handleReturn).toBe('not-handled')
    })

    it('Calls maybeSplitSection if in empty block', () => {
      const originalLength = props.sections.models.length
      props.section.body = '<p>hello</p><p><br></p>'
      const component = getWrapper(props)
      component.instance().onChange(getSelection(true))
      component.instance().focus()
      const handleReturn = component.instance().handleReturn({
        key: 'enter',
        preventDefault: jest.fn()
      })

      expect(handleReturn).toBe('handled')
      expect(props.sections.models.length).toBe(originalLength + 1)
    })
  })

  describe('#handleBackspace', () => {
    it('Returns default behavior if cursor anchorOffset is not 0', () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection(true))
      component.instance().focus()
      const handleBackspace = component.instance().handleBackspace({key: 'backspace'})

      expect(handleBackspace).toBe('not-handled')
      expect(props.onSetEditing.mock.calls.length).toBe(0)
    })

    it('Merges section with previous section if at start of block', () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().focus()
      const handleBackspace = component.instance().handleBackspace({key: 'backspace'})

      expect(handleBackspace).toBe('handled')
      expect(props.onSetEditing.mock.calls.length).toBe(props.index - 1)
      expect(component.state().html).toMatch(props.section.body)
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
      component.instance().handleChangeSection({key: 'ArrowRight'})

      expect(props.onSetEditing.mock.calls[0][0]).toBe(props.index + 1)
    })

    it('L-> Moves the cursor to the previous section if at start of block', () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleChangeSection({key: 'ArrowLeft'})

      expect(props.onSetEditing.mock.calls[0][0]).toBe(props.index - 1)
    })

    it('U-> Moves the cursor to the previous section if at start of block', () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleChangeSection({key: 'ArrowUp'})

      expect(props.onSetEditing.mock.calls[0][0]).toBe(props.index - 1)
    })

    it('D-> Moves the cursor to the next section if at end of block', () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection(true))
      component.instance().focus()
      component.instance().handleChangeSection({key: 'ArrowDown'})

      expect(props.onSetEditing.mock.calls[0][0]).toBe(props.index + 1)
    })
  })
})

import React from 'react'
import { clone } from 'lodash'
import { mount } from 'enzyme'
import { EditorState } from 'draft-js'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Sections from '/client/collections/sections.coffee'
import { TextNav } from 'client/components/rich_text/components/text_nav'
import { TextInputUrl } from 'client/components/rich_text/components/input_url'
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
    article = clone(StandardArticle)
    props = {
      article,
      index: 2,
      onChange: jest.fn(),
      onSetEditing: jest.fn(),
      section: article.sections[11],
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
      const selection = startSelection.merge({
        anchorKey: key,
        anchorOffset: 0,
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

    xit('Converts html on change with only plugin supported classes', () => {

    })
// it 'Converts html on change with only plugin supported classes', ->
//   @component.onChange(@component.state.editorState)
//   @component.state.html.should.eql '<h2>01 &nbsp;<a href="artsy.net">here is a link.</a></h2><p>In 2016, K mounted a <span><a href="https://www.artsy.net/artist/kow-hiwa" class="is-follow-link">solo show</a><a data-id="kow-hiwa" class="entity-follow artist-follow"></a></span> at prescient Berlin gallery <a href="https://www.artsy.net/kow">KOW</a>, restaging his installation <em>It’s Spring and the Weather is Great so let’s close all object matters</em> (2012), for which he created seven step ladders with microphones and instruments attached for a performance initially meant to take place at Speakers’ Corner in London’s Hyde Park that was eventually mounted in 2010 at the <a href="https://www.artsy.net/serpentineuk">Serpentine Galleries</a>.</p><p><br></p>'
  })

  describe('#availableBlocks', () => {
    it('Returns the correct blocks for a feature article', () => {
      props.article.layout = 'feature'
      props.hasFeatures = true
      const component = getWrapper(props)
      const expected = component.instance().availableBlocks()

      expect(expected).toEqual([
        'header-one',
        'header-two',
        'header-three',
        'blockquote',
        'unordered-list-item',
        'ordered-list-item',
        'unstyled'
      ])
    })

    it('Returns the correct blocks for a standard article', () => {
      props.article.layout = 'standard'
      props.hasFeatures = true
      const component = getWrapper(props)
      const expected = component.instance().availableBlocks()

      expect(expected).toEqual([
        'header-two',
        'header-three',
        'blockquote',
        'unordered-list-item',
        'ordered-list-item',
        'unstyled'
      ])
    })

    it('Returns the correct blocks for a classic article with features', () => {
      props.article.layout = 'classic'
      props.hasFeatures = true
      const component = getWrapper(props)
      const expected = component.instance().availableBlocks()

      expect(expected).toEqual([
        'header-two',
        'header-three',
        'blockquote',
        'unordered-list-item',
        'ordered-list-item',
        'unstyled'
      ])
    })

    it('Returns the correct blocks for a classic article without features', () => {
      props.article.layout = 'classic'
      props.hasFeatures = false
      const component = getWrapper(props)
      const expected = component.instance().availableBlocks()

      expect(expected).toEqual([
        'header-two',
        'header-three',
        'unordered-list-item',
        'ordered-list-item',
        'unstyled'
      ])
    })
  })

  describe('Editorial Features', () => {
    it('Adds end-marker to a standard article', () => {
      props.isContentEnd = true
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

  describe('Rich text events', () => {
    beforeEach(() => {
      props.section = {body: '<p>A short piece of text</p>'}
    })

    describe('TextNav', () => {
      it('Can create italic entities', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')
        component.find('.italic').simulate('mouseDown')

        expect(component.state().html).toBe('<p><em>A short piece of text</em></p>')
      })

      it('Can create bold entities', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')
        component.find('.bold').simulate('mouseDown')

        expect(component.state().html).toBe('<p><strong>A short piece of text</strong></p>')
      })

      it('Can create strikethrough entities', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')
        component.find('.strikethrough').simulate('mouseDown')

        expect(component.state().html).toBe('<p><span style="text-decoration:line-through">A short piece of text</span></p>')
      })

      it('Can create h1 blocks (feature)', () => {
        props.article.layout = 'feature'
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')
        component.find('.header-one').simulate('mouseDown')

        expect(component.state().html).toBe('<h1>A short piece of text</h1>')
      })

      it('Can create h2 blocks', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')
        component.find('.header-two').simulate('mouseDown')

        expect(component.state().html).toBe('<h2>A short piece of text</h2>')
      })

      it('Can create h3 blocks', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')
        component.find('.header-three').simulate('mouseDown')

        expect(component.state().html).toBe('<h3>A short piece of text</h3>')
      })

      it('Can create h3 blocks without stripping styles (standard/feature)', () => {
        props.section.body = '<p><em>A short piece of text</em></p>'
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')
        component.find('.header-three').simulate('mouseDown')

        expect(component.state().html).toBe('<h3><em>A short piece of text</em></h3>')
      })

      it('Strips styles from h3 blocks in classic articles', () => {
        props.section.body = '<p><em>A short piece of text</em></p>'
        props.article.layout = 'classic'
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')
        component.find('.header-three').simulate('mouseDown')

        expect(component.state().html).toBe('<h3>A short piece of text</h3>')
      })

      it('Can create UL blocks', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')
        component.find('.unordered-list-item').simulate('mouseDown')

        expect(component.state().html).toBe('<ul><li>A short piece of text</li></ul>')
      })

      it('Can create OL blocks', () => {
        props.article.layout = 'classic'
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')
        component.find('.ordered-list-item').simulate('mouseDown')

        expect(component.state().html).toBe('<ol><li>A short piece of text</li></ol>')
      })

      it('Can create blockquote blocks', () => {
        props.hasFeatures = true
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')
        component.find('.blockquote').simulate('mouseDown')

        expect(component.state().html).toBe('<blockquote>A short piece of text</blockquote>')
      })

      it('Can make plain text', () => {
        props.section.body = '<h3><em>A short piece of text</em></h3>'
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')
        component.find('.clear-formatting').simulate('mouseDown')

        expect(component.state().html).toBe('<p>A short piece of text</p>')
      })
    })
    describe('#handleKeyCommand', () => {
      it('Can create bold entities', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.instance().handleKeyCommand('bold')

        expect(component.state().html).toBe('<p><strong>A short piece of text</strong></p>')
      })

      it('Can create italic entities', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.instance().handleKeyCommand('italic')

        expect(component.state().html).toBe('<p><em>A short piece of text</em></p>')
      })

      it('Can create strikethrough entities', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.instance().handleKeyCommand('strikethrough')

        expect(component.state().html).toBe(
          '<p><span style="text-decoration:line-through">A short piece of text</span></p>'
        )
      })

      it('Can create h1 blocks (feature)', () => {
        props.article.layout = 'feature'
        props.hasFeatures = true
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.instance().handleKeyCommand('header-one')

        expect(component.state().html).toBe('<h1>A short piece of text</h1>')
      })

      it('Cannot create h1 blocks if classic or standard', () => {
        props.hasFeatures = true
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.instance().handleKeyCommand('header-one')

        expect(component.state().html).toBe('<p>A short piece of text</p>')
      })

      it('Can create h2 blocks (feature)', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.instance().handleKeyCommand('header-two')

        expect(component.state().html).toBe('<h2>A short piece of text</h2>')
      })

      it('Can create h3 blocks (feature)', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.instance().handleKeyCommand('header-three')

        expect(component.state().html).toBe('<h3>A short piece of text</h3>')
      })

      it('Can create UL blocks (feature)', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.instance().handleKeyCommand('unordered-list-item')

        expect(component.state().html).toBe('<ul><li>A short piece of text</li></ul>')
      })

      it('Can create OL blocks (feature)', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.instance().handleKeyCommand('ordered-list-item')

        expect(component.state().html).toBe('<ol><li>A short piece of text</li></ol>')
      })

      it('Can create blockquote blocks', () => {
        props.hasFeatures = true
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.instance().handleKeyCommand('blockquote')

        expect(component.state().html).toBe('<blockquote>A short piece of text</blockquote>')
      })

      it('Cannot create blockquotes if props.hasFeatures is false', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.instance().handleKeyCommand('blockquote')

        expect(component.state().html).toBe('<p>A short piece of text</p>')
      })

      it('Can make plain text', () => {
        props.section.body = '<h3><em>A short piece of text</em></h3>'
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.instance().handleKeyCommand('custom-clear')

        expect(component.state().html).toBe('<p>A short piece of text</p>')
      })
    })
  })
  describe('Links', () => {
    it('Opens a link input popup from the menu', () => {
      props.editing = true
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find('.SectionText__input').simulate('mouseUp')
      component.find('.link').simulate('mouseDown')

      expect(component.state().showUrlInput).toBe(true)
      expect(component.find(TextInputUrl).exists()).toBe(true)
    })

    it('Opens a link input popup via key command', () => {
      props.editing = true
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find('.SectionText__input').simulate('mouseUp')
      component.instance().handleKeyCommand('link-prompt')

      expect(component.state().showUrlInput).toBe(true)
      expect(component.html()).toMatch('class="TextInputUrl')
    })

    it('Can confirm links', () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())

      component.instance().confirmLink('link.com')
      expect(component.state().html).toMatch('<a href="link.com">')
      expect(component.html()).toMatch('<a href="link.com">')
    })

    it('Can handle special characters inside links correctly', () => {
      props.section.body = '<a href="http://artsy.net">Hauser & Wirth</a>'
      const component = getWrapper(props)

      expect(component.state().html).toMatch('Hauser &amp; Wirth')
      expect(component.html()).toMatch('Hauser &amp; Wirth')
      expect(component.text()).toMatch('Hauser & Wirth')
    })

    describe('Artist follow plugin', () => {
      it('Renders an artist menu item if hasFeatures is true', () => {
        props.hasFeatures = true
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')

        expect(component.find('.artist').exists()).toBe(true)
      })

      it('Does not show artist if hasFeatures is false', () => {
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')

        expect(component.find('.artist').exists()).toBe(false)
      })

      it('Can setup link prompt for artist blocks', () => {
        props.hasFeatures = true
        const component = getWrapper(props)
        component.instance().onChange(getSelection())
        component.find('.SectionText__input').simulate('mouseUp')
        component.find('.artist').simulate('mouseDown')

        expect(component.state().showUrlInput).toBe(true)
        expect(component.state().plugin).toBe('artist')
      })

      it('Adds data-id to artist links', () => {
        props.hasFeatures = true
        props.section.body = '<p><a href="https://www.artsy.net/artist/erin-shirreff" class="is-follow-link">Erin Shirreff</a> is an artist.</p>'
        const component = getWrapper(props)
        component.instance().onChange(component.state().editorState)

        expect(component.state().html).toMatch('<a data-id="erin-shirreff" class="entity-follow artist-follow"></a>')
      })
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
        '<p>Here is a</p><ul><li><strong>caption</strong></li><li>about an image</li></ul><p>yep.'
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
})

// xdescribe '#handleChangeSection', ->

// it 'R-> Moves the cursor to next block if at end of block', ->
//   setSelection = @component.state.editorState.getSelection().merge({
//     anchorKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
//     anchorOffset: @component.state.editorState.getCurrentContent().getFirstBlock().getLength()
//     focusKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
//     focusOffset: @component.state.editorState.getCurrentContent().getFirstBlock().getLength()
//   })
//   newEditorState = EditorState.acceptSelection(@component.state.editorState, setSelection)
//   @component.onChange newEditorState
//   @component.onChange = sinon.stub()
//   @component.handleKeyCommand({key: 'ArrowRight'})
//   prevSelection = @component.state.editorState.getSelection()
//   newSelection = @component.onChange.args[0][0].getSelection()
//   newSelection.anchorOffset.should.eql 0
//   newSelection.anchorOffset.should.not.eql prevSelection.achorOffset
//   newSelection.anchorKey.should.not.eql prevSelection.anchorKey

// it 'L-> Moves the cursor to previous block if at start of block', ->
//   firstBlock = @component.state.editorState.getCurrentContent().getFirstBlock().key
//   setSelection = @component.state.editorState.getSelection().merge({
//     anchorKey: @component.state.editorState.getCurrentContent().getBlockAfter(firstBlock).key
//     anchorOffset: 0
//     focusKey: @component.state.editorState.getCurrentContent().getBlockAfter(firstBlock).key
//     focusOffset: 0
//   })
//   newEditorState = EditorState.acceptSelection(@component.state.editorState, setSelection)
//   @component.onChange newEditorState
//   @component.onChange = sinon.stub()
//   @component.handleKeyCommand({key: 'ArrowLeft'})
//   prevSelection = @component.state.editorState.getSelection()
//   newSelection = @component.onChange.args[0][0].getSelection()
//   newSelection.anchorOffset.should.eql 19
//   newSelection.anchorOffset.should.not.eql prevSelection.achorOffset
//   newSelection.anchorKey.should.not.eql prevSelection.anchorKey

// it 'R-> Moves the cursor to the next section if at end of block', ->
//   setSelection = @component.state.editorState.getSelection().merge({
//     anchorKey: @component.state.editorState.getCurrentContent().getLastBlock().key
//     anchorOffset: @component.state.editorState.getCurrentContent().getLastBlock().getLength()
//     focusKey: @component.state.editorState.getCurrentContent().getLastBlock().key
//     focusOffset: @component.state.editorState.getCurrentContent().getLastBlock().getLength()
//   })
//   newEditorState = EditorState.acceptSelection(@component.state.editorState, setSelection)
//   @component.onChange newEditorState
//   @component.handleKeyCommand({key: 'ArrowRight'})
//   @component.props.onSetEditing.args[0][0].should.eql 2

// it 'L-> Moves the cursor to the previous section if at start of block', ->
//   setSelection = @component.state.editorState.getSelection().merge({
//     anchorKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
//     anchorOffset: 0
//     focusKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
//     focusOffset: 0
//   })
//   newEditorState = EditorState.acceptSelection(@component.state.editorState, setSelection)
//   @component.onChange newEditorState
//   @component.handleKeyCommand({key: 'ArrowLeft'})
//   @component.props.onSetEditing.args[0][0].should.eql 0

benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'
Backbone = require 'backbone'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-dom/test-utils'
{ EditorState } = require 'draft-js'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'Section Text', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
      window.jQuery = $
      window.getSelection = sinon.stub().returns(
        isCollapsed: false
        getRangeAt: sinon.stub().returns(
          getClientRects: sinon.stub.returns([{
            bottom: 170
            height: 25
            left: 425
            right: 525
            top: 145
            width: 95
          }])
        )
      )
      window.matchMedia = sinon.stub().returns(
        {
          matches: false
          addListener: sinon.stub()
          removeListener: sinon.stub()
        }
      )
      global.Node = window.Node
      global.Element = window.Element
      global.HTMLElement = window.HTMLElement
      global.document = window.document
      @SectionText = benv.require resolve(__dirname, '../index')
      { TextInputUrl } = benv.require(
        resolve(__dirname, '../../../../../../../components/rich_text/components/input_url')
      )
      { TextNav } = benv.require(
        resolve(__dirname, '../../../../../../../components/rich_text/components/text_nav')
      )
      @SectionText.__set__ 'TextInputUrl', TextInputUrl
      @SectionText.__set__ 'TextNav', TextNav
      @SectionText.__set__ 'stickyControlsBox', sinon.stub().returns {top: 20, left: 40}
      @sections = new Backbone.Collection [
        {
          body: '<h2>01  <a href="artsy.net">here is a link.</a></h2><p class="stuff">In 2016, K mounted a <span><a href="https://www.artsy.net/artist/kow-hiwa" class="is-follow-link" target="_blank">solo show</a><a class="entity-follow artist-follow"></a></span> at prescient Berlin gallery <a href="https://www.artsy.net/kow" target="_blank">KOW</a>, restaging his installation <i>It’s Spring and the Weather is Great so let’s close all object matters</i> (2012), for which he created seven step ladders with microphones and instruments attached for a performance initially meant to take place at Speakers’ Corner in London’s Hyde Park that was eventually mounted in 2010 at the <a href="https://www.artsy.net/serpentineuk" target="_blank">Serpentine Galleries</a>.</p><p><br></p><br>'
          type: 'text'
        },
        {
          body: '<h2>A <em>short</em> piece of <b>text</b></h2>'
          type: 'text'
        },
        {
          body: '<h2><a href="https://www.artsy.net/artist/erin-shirreff" class="is-follow-link">Erin & Shirreff</a></h2>'
          type: 'text'
        }
      ]
      article = {layout: 'classic'}

      @props = {
        editing: false
        section: @sections.models[0]
        sections: @sections
        index: 1
        onSetEditing: sinon.stub()
        article: article
        hasFeatures: true
      }
      @altProps = {
        editing: true
        section: @sections.models[1]
        sections: @sections
        index: 1
        onSetEditing: sinon.stub()
        hasFeatures: true
        article: article
        isContentStart: true
        isContentEnd: true
      }
      @artistProps = {
        editing: true
        section: @sections.models[2]
        sections: @sections
        article: article
        hasFeatures: true
      }
      @component = ReactDOM.render React.createElement(@SectionText, @props), (@$el = $ "<div></div>")[0], => setTimeout =>
        @component.stickyControlsBox = sinon.stub().returns {top: 20, left: 40}

        # a second component for text selection
        @shortComponent = ReactDOM.render React.createElement(@SectionText, @altProps), (@$el = $ "<div></div>")[0]
        @shortComponent.state.editorState.getSelection().isCollapsed = sinon.stub().returns false
        shortSelection = @shortComponent.state.editorState.getSelection()
        newSelection = shortSelection.merge({
          anchorKey: @shortComponent.state.editorState.getCurrentContent().getFirstBlock().key
          anchorOffset: 0
          focusKey: @shortComponent.state.editorState.getCurrentContent().getFirstBlock().key
          focusOffset: @shortComponent.state.editorState.getCurrentContent().getFirstBlock().text.length
        })
        newEditorState = EditorState.acceptSelection(@shortComponent.state.editorState, newSelection)
        @shortComponent.onChange newEditorState
        done()

  afterEach ->
    benv.teardown()


  describe 'Mount and Display', ->

    it 'Converts existing html to an editorState', ->
      @component.state.editorState.getCurrentContent().getFirstBlock().should.not.eql @component.state.editorState.getCurrentContent().getLastBlock()

    it 'Can render saved content in the editor', ->
      editorText = $(ReactDOM.findDOMNode(@component)).find('.edit-section--text__input').text()
      editorText.should.containEql 'K mounted a solo show at prescient Berlin gallery KOW, restaging his installation It’s Spring and the Weather is Great'

    it 'Hides the menu when no text selected', ->
      @component.state.showMenu.should.eql false
      $(ReactDOM.findDOMNode(@component)).find('.TextNav').length.should.eql 0

    it 'Shows the menu when text is selected', ->
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      @shortComponent.state.showMenu.should.eql true
      $(ReactDOM.findDOMNode(@shortComponent)).find('.TextNav').length.should.eql 1

    it 'Converts html on change with only plugin supported classes', ->
      @component.onChange(@component.state.editorState)
      @component.state.html.should.eql '<h2>01 &nbsp;<a href="artsy.net">here is a link.</a></h2><p>In 2016, K mounted a <span><a href="https://www.artsy.net/artist/kow-hiwa" class="is-follow-link">solo show</a><a data-id="kow-hiwa" class="entity-follow artist-follow"></a></span> at prescient Berlin gallery <a href="https://www.artsy.net/kow">KOW</a>, restaging his installation <em>It’s Spring and the Weather is Great so let’s close all object matters</em> (2012), for which he created seven step ladders with microphones and instruments attached for a performance initially meant to take place at Speakers’ Corner in London’s Hyde Park that was eventually mounted in 2010 at the <a href="https://www.artsy.net/serpentineuk">Serpentine Galleries</a>.</p><p><br></p>'

  describe '#availableBlocks', ->

    it 'Returns the correct blocks for a feature article', ->
      @shortComponent.props.article.layout = 'feature'
      availableBlocks = @shortComponent.availableBlocks()
      availableBlocks.should.eql [
        'header-one',
        'header-two',
        'header-three',
        'blockquote',
        'unordered-list-item',
        'ordered-list-item',
        'unstyled'
      ]

    it 'Returns the correct blocks for a standard article', ->
      @shortComponent.props.article.layout = 'standard'
      availableBlocks = @shortComponent.availableBlocks()
      availableBlocks.should.eql [
        'header-two',
        'header-three',
        'blockquote',
        'unordered-list-item',
        'ordered-list-item',
        'unstyled'
      ]

    it 'Returns the correct blocks for a classic article with features', ->
      availableBlocks = @shortComponent.availableBlocks()
      availableBlocks.should.eql [
        'header-two',
        'header-three',
        'blockquote',
        'unordered-list-item',
        'ordered-list-item',
        'unstyled'
      ]

    it 'Returns the correct blocks for a classic article without features', ->
      @props.hasFeatures = false
      component = ReactDOM.render React.createElement(@SectionText, @props), (@$el = $ "<div></div>")[0]
      availableBlocks = component.availableBlocks()
      availableBlocks.should.eql [
        'header-two',
        'header-three',
        'unordered-list-item',
        'ordered-list-item',
        'unstyled'
      ]

  describe 'Editorial Features', ->

    it 'Adds end-marker to a feature article', ->
      @altProps.article.layout = 'feature'
      component = ReactDOM.render React.createElement(@SectionText, @altProps), (@$el = $ "<div></div>")[0]
      component.state.html.should.containEql '<span class="content-end"> </span>'

    it 'Adds end-marker to a standard article', ->
      @altProps.article.layout = 'standard'
      component = ReactDOM.render React.createElement(@SectionText, @altProps), (@$el = $ "<div></div>")[0]
      component.state.html.should.containEql '<span class="content-end"> </span>'

  describe 'Rich text menu events', ->

    it 'Can create italic entities', ->
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      @shortComponent.setState = sinon.stub()
      r.simulate.mouseDown r.find @shortComponent, 'italic'
      @shortComponent.setState.args[0][0].html.should.eql '<h2><em>A short piece of <strong>text</strong></em></h2>'

    it 'Can create bold entities', ->
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      @shortComponent.setState = sinon.stub()
      r.simulate.mouseDown r.find @shortComponent, 'bold'
      @shortComponent.setState.args[0][0].html.should.eql '<h2><strong>A <em>short</em> piece of text</strong></h2>'

    it 'Can create strikethrough entities', ->
      @shortComponent.props.article.layout = 'standard'
      @shortComponent.render()
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      @shortComponent.setState = sinon.stub()
      r.simulate.mouseDown r.find @shortComponent, 'strikethrough'
      @shortComponent.setState.args[0][0].html.should.eql '<h2><span style="text-decoration:line-through">A <em>short</em> piece of <strong>text</strong></span></h2>'

    it 'Can toggle h1 block changes (feature)', ->
      @shortComponent.props.article.layout = 'feature'
      @shortComponent.render()
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      @shortComponent.setState = sinon.stub()
      r.simulate.mouseDown r.find @shortComponent, 'header-one'
      @shortComponent.setState.args[0][0].html.should.eql '<h1>A <em>short</em> piece of <strong>text</strong></h1>'

    it 'Can toggle h2 block changes', ->
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      @shortComponent.setState = sinon.stub()
      r.simulate.mouseDown r.find @shortComponent, 'header-two'
      @shortComponent.setState.args[0][0].html.should.eql '<p>A <em>short</em> piece of <strong>text</strong></p>'

    it 'Can toggle h3 block changes and strip the styles (classic)', ->
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      @shortComponent.setState = sinon.stub()
      r.simulate.mouseDown r.find @shortComponent, 'header-three'
      @shortComponent.setState.args[0][0].html.should.eql '<h3>A short piece of text</h3>'

    it 'Can toggle h3 block changes without stripping styles (standard/feature)', ->
      @shortComponent.props.article.layout = 'standard'
      @shortComponent.render()
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      @shortComponent.setState = sinon.stub()
      r.simulate.mouseDown r.find @shortComponent, 'header-three'
      @shortComponent.setState.args[0][0].html.should.eql '<h3>A <em>short</em> piece of <strong>text</strong></h3>'

    it 'Can toggle ul block changes', ->
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      @shortComponent.setState = sinon.stub()
      r.simulate.mouseDown r.find @shortComponent, 'unordered-list-item'
      @shortComponent.setState.args[0][0].html.should.eql '<ul><li>A <em>short</em> piece of <strong>text</strong></li></ul>'

    it 'Can toggle ol block changes', ->
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      @shortComponent.setState = sinon.stub()
      r.simulate.mouseDown r.find @shortComponent, 'ordered-list-item'
      @shortComponent.setState.args[0][0].html.should.eql '<ol><li>A <em>short</em> piece of <strong>text</strong></li></ol>'

    it 'Can toggle blockquote changes (if hasFeatures)', ->
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      @shortComponent.setState = sinon.stub()
      r.simulate.mouseDown r.find @shortComponent, 'blockquote'
      @shortComponent.setState.args[0][0].html.should.eql '<blockquote>A <em>short</em> piece of <strong>text</strong></blockquote>'
      @shortComponent.props.section.get('layout').should.eql 'blockquote'

    it '#makePlainText Can strip styles', ->
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      @shortComponent.makePlainText()
      @shortComponent.state.html.should.eql '<p>A short piece of text</p>'


  describe '#handleKeyCommand', ->

    it 'Can toggle bold entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('bold')
      @shortComponent.setState.args[0][0].html.should.eql '<h2><strong>A <em>short</em> piece of text</strong></h2>'

    it 'Can toggle italic entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('italic')
      @shortComponent.setState.args[0][0].html.should.eql '<h2><em>A short piece of <strong>text</strong></em></h2>'

    it 'Can toggle strikethrough entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('strikethrough')
      @shortComponent.setState.args[0][0].html.should.eql '<h2><span style="text-decoration:line-through">A <em>short</em> piece of <strong>text</strong></span></h2>'

    it 'Can toggle H1 entities (feature)', ->
      @shortComponent.props.article.layout = 'feature'
      @shortComponent.render()
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('header-one')
      @shortComponent.setState.args[0][0].html.should.eql '<h1>A <em>short</em> piece of <strong>text</strong></h1>'

    it 'Cannot toggle H1 entities if not feature layout', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('header-one')
      @shortComponent.setState.called.should.not.be.ok
      @shortComponent.state.html.should.eql '<h2>A <em>short</em> piece of <strong>text</strong></h2>'

    it 'Can toggle H2 entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('header-two')
      @shortComponent.setState.args[0][0].html.should.eql '<p>A <em>short</em> piece of <strong>text</strong></p>'

    it 'Can toggle H3 entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('header-three')
      @shortComponent.setState.args[0][0].html.should.eql '<h3>A short piece of text</h3>'

    it 'Can toggle UL entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('unordered-list-item')
      @shortComponent.setState.args[0][0].html.should.eql '<ul><li>A <em>short</em> piece of <strong>text</strong></li></ul>'

    it 'Can toggle OL entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('ordered-list-item')
      @shortComponent.setState.args[0][0].html.should.eql '<ol><li>A <em>short</em> piece of <strong>text</strong></li></ol>'

    it 'Can toggle Blockquote entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('blockquote')
      @shortComponent.setState.args[0][0].html.should.eql '<blockquote>A <em>short</em> piece of <strong>text</strong></blockquote>'
      @shortComponent.props.section.get('layout').should.eql 'blockquote'

    it 'Cannot toggle Blockquotes if hasFeatures is false', ->
      @altProps.hasFeatures = false
      component = ReactDOM.render React.createElement(@SectionText, @altProps), (@$el = $ "<div></div>")[0]
      component.setState = sinon.stub()
      component.handleKeyCommand('blockquote')
      component.setState.called.should.not.be.ok
      component.state.html.should.eql '<h2>A <em>short</em> piece of <strong>text</strong></h2>'

    it 'Can make plain text', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('custom-clear')
      @shortComponent.setState.args[0][0].html.should.eql '<p>A short piece of text</p>'

    it 'Can open a link prompt', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('link-prompt')
      @shortComponent.setState.args[0][0].showUrlInput.should.eql true


  describe 'Links', ->

    it 'Opens a link input popup', ->
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      r.simulate.mouseDown r.find @shortComponent, 'link'
      $(ReactDOM.findDOMNode(@shortComponent)).find('.TextInputUrl').length.should.eql 1
      @shortComponent.state.showUrlInput.should.eql true

    it 'Can confirm links', ->
      @shortComponent.confirmLink 'link.com'
      @shortComponent.state.html.should.containEql '<a href="link.com">'

    it 'Can handle special characters inside links correctly', ->
      @props.section = @sections.models[2]
      component = ReactDOM.render React.createElement(@SectionText, @props), (@$el = $ "<div></div>")[0]
      $(ReactDOM.findDOMNode(component)).find('.edit-section--text__input').text().should.containEql 'Erin & Shirreff'
      $(ReactDOM.findDOMNode(component)).find('.edit-section--text__input').html().should.containEql 'Erin &amp; Shirreff'
      component.state.html.should.containEql 'Erin & Shirreff'

  describe 'Artist plugin', ->

    it 'Renders an artist menu item if hasFeatures is true', ->
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      r.find(@shortComponent, 'artist').should.be.ok
      $(ReactDOM.findDOMNode(@shortComponent)).find('button.artist').length.should.eql 1

    it 'Does not show artist if hasFeatures is false', ->
      @altProps.hasFeatures = false
      component = ReactDOM.render React.createElement(@SectionText, @altProps), (@$el = $ "<div></div>")[0]
      r.simulate.mouseUp r.find component, 'edit-section--text__input'
      $(ReactDOM.findDOMNode(component)).find('button.artist').length.should.eql 0

    it 'Can setup link prompt for artist blocks', ->
      r.simulate.mouseUp r.find @shortComponent, 'edit-section--text__input'
      r.simulate.mouseDown r.find @shortComponent, 'artist'
      @shortComponent.state.showUrlInput.should.eql true
      @shortComponent.state.pluginType.should.eql 'artist'

    it 'Adds data-id to artist links', ->
      component = ReactDOM.render React.createElement(@SectionText, @artistProps), (@$el = $ "<div></div>")[0]
      component.onChange(component.state.editorState)
      component.state.html.should.eql '<h2><span><a href="https://www.artsy.net/artist/erin-shirreff" class="is-follow-link">Erin &amp; Shirreff</a><a data-id="erin-shirreff" class="entity-follow artist-follow"></a></span></h2>'

  describe '#toggleBlockQuote', ->

    it 'Splits a blockquote into its own text section', ->
      originalLength = @component.props.sections.length
      @component.props.section.set 'body', '<p>A text before.</p><blockquote>A blockquote.</blockquote><p>A text after.</p>'
      @component.toggleBlockQuote()
      @component.props.section.get('type').should.eql 'text'
      @component.props.section.get('body').should.eql '<blockquote>A blockquote.</blockquote>'
      @component.props.sections.length.should.eql originalLength + 2

    it 'Creates a new section for text before a blockquote', ->
      newBody = '<p>A text before.</p><blockquote>A blockquote.</blockquote>'
      originalLength = @component.props.sections.length
      @component.props.section.set 'body', newBody
      @component.props.sections.models[@component.props.index].set 'body', newBody
      @component.toggleBlockQuote()
      @component.props.sections.length.should.eql originalLength + 1
      @component.props.sections.models[@component.props.index].get('body').should.eql '<p>A text before.</p>'

    it 'Creates a new section for text after a blockquote', ->
      newBody = '<blockquote>A blockquote.</blockquote><p>A text after.</p>'
      originalLength = @component.props.sections.length
      @component.props.section.set 'body', newBody
      @component.props.sections.models[@component.props.index].set 'body', newBody
      @component.toggleBlockQuote()
      @component.props.sections.length.should.eql originalLength + 1
      @component.props.sections.models[@component.props.index + 1].get('body').should.eql '<p>A text after.</p>'


  xdescribe '#handleChangeSection', ->

    it 'R-> Moves the cursor to next block if at end of block', ->
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        anchorOffset: @component.state.editorState.getCurrentContent().getFirstBlock().getLength()
        focusKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        focusOffset: @component.state.editorState.getCurrentContent().getFirstBlock().getLength()
      })
      newEditorState = EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.onChange = sinon.stub()
      @component.handleKeyCommand({key: 'ArrowRight'})
      prevSelection = @component.state.editorState.getSelection()
      newSelection = @component.onChange.args[0][0].getSelection()
      newSelection.anchorOffset.should.eql 0
      newSelection.anchorOffset.should.not.eql prevSelection.achorOffset
      newSelection.anchorKey.should.not.eql prevSelection.anchorKey

    it 'L-> Moves the cursor to previous block if at start of block', ->
      firstBlock = @component.state.editorState.getCurrentContent().getFirstBlock().key
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getBlockAfter(firstBlock).key
        anchorOffset: 0
        focusKey: @component.state.editorState.getCurrentContent().getBlockAfter(firstBlock).key
        focusOffset: 0
      })
      newEditorState = EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.onChange = sinon.stub()
      @component.handleKeyCommand({key: 'ArrowLeft'})
      prevSelection = @component.state.editorState.getSelection()
      newSelection = @component.onChange.args[0][0].getSelection()
      newSelection.anchorOffset.should.eql 19
      newSelection.anchorOffset.should.not.eql prevSelection.achorOffset
      newSelection.anchorKey.should.not.eql prevSelection.anchorKey

    it 'R-> Moves the cursor to the next section if at end of block', ->
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getLastBlock().key
        anchorOffset: @component.state.editorState.getCurrentContent().getLastBlock().getLength()
        focusKey: @component.state.editorState.getCurrentContent().getLastBlock().key
        focusOffset: @component.state.editorState.getCurrentContent().getLastBlock().getLength()
      })
      newEditorState = EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.handleKeyCommand({key: 'ArrowRight'})
      @component.props.onSetEditing.args[0][0].should.eql 2

    it 'L-> Moves the cursor to the previous section if at start of block', ->
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        anchorOffset: 0
        focusKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        focusOffset: 0
      })
      newEditorState = EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.handleKeyCommand({key: 'ArrowLeft'})
      @component.props.onSetEditing.args[0][0].should.eql 0


  describe '#handleTab', ->

    it 'jumps to the next section', ->
      @component.handleTab {key: 'tab', preventDefault: sinon.stub()}
      @component.props.onSetEditing.args[0][0].should.eql 2

    it 'if shift key, jumps to the previous section', ->
      @component.handleTab {key: 'tab', shiftKey: true, preventDefault: sinon.stub()}
      @component.props.onSetEditing.args[0][0].should.eql 0


  describe '#handleReturn', ->

    it 'returns default behaviour if in first block', ->
      @component.splitSection = sinon.stub()
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        anchorOffset: 0
        focusKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        focusOffset: 0
      })
      newEditorState = EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.handleReturn({key: 'enter'})
      @component.splitSection.notCalled.should.eql true

    it 'returns default behaviour if in block with content', ->
      @component.splitSection = sinon.stub()
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        anchorOffset: 1
        focusKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        focusOffset: 1
      })
      newEditorState = EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.handleReturn({key: 'enter'})
      @component.splitSection.notCalled.should.eql true

    it 'calls splitSection if in empty block', ->
      @component.splitSection = sinon.stub()
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getLastBlock().key
        anchorOffset: 0
        focusKey: @component.state.editorState.getCurrentContent().getLastBlock().key
        focusOffset: 0
      })
      newEditorState = EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.handleReturn({key: 'enter', preventDefault: sinon.stub()})
      @component.splitSection.called.should.eql true

  describe '#handleBackspace', ->

    it 'merges section with previous section if at start of block', ->
      setSelection = @shortComponent.state.editorState.getSelection().merge({
        anchorKey: @shortComponent.state.editorState.getCurrentContent().getFirstBlock().key
        anchorOffset: 0
        focusKey: @shortComponent.state.editorState.getCurrentContent().getFirstBlock().key
        focusOffset: 0
      })
      newEditorState = EditorState.acceptSelection(@shortComponent.state.editorState, setSelection)
      @shortComponent.onChange newEditorState
      @shortComponent.handleBackspace {key: 'backspace'}
      @shortComponent.props.onSetEditing.args[0][0].should.eql 0
      @shortComponent.state.html.should.containEql '<h2>A <em>short</em> piece of <strong>text</strong></h2>'
      @shortComponent.state.html.should.containEql '<p>In 2016, K mounted a'

  describe '#splitSection', ->

    it 'splits a section into two', ->
      firstBlock = @component.state.editorState.getCurrentContent().getFirstBlock().key
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getKeyAfter(firstBlock)
        anchorOffset: 0
        focusKey: @component.state.editorState.getCurrentContent().getKeyAfter(firstBlock)
        focusOffset: 0
      })
      newEditorState = EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.handleReturn({key: 'enter', preventDefault: sinon.stub()})
      @component.handleReturn({key: 'enter', preventDefault: sinon.stub()})
      @component.props.sections.length.should.eql 4
      @component.state.html.should.not.containEql '<p>In 2016, K mounted a'
      @component.props.sections.models[@component.props.index + 1].get('body').should.containEql '<p>In 2016, K mounted a'


  describe '#onPaste', ->

    it 'strips or converts unsupported html and linebreaks', ->
      @component.onPaste('Here is a caption about an image yep.', '<meta><script>bad.stuff()</script><h1 class="stuff">Here is a</h1><ul><li><b>caption</b></li><li>about an <pre>image</pre></li></ul><p>yep.</p><br>')
      @component.state.html.should.containEql '<p>Here is a</p><ul><li><strong>caption</strong></li><li>about an image</li></ul>'

    it 'does not overwrite existing content', ->
      @component.onPaste('Here is a caption about an image yep.', '<meta><script>bad.stuff()</script><h1 class="stuff">Here is a</h1><ul><li><b>caption</b></li><li>about an <pre>image</pre></li></ul><p>yep.</p><br>')
      @component.state.html.should.startWith '<p>Here is a</p><ul><li><strong>caption</strong></li><li>about an image</li></ul>'
      @component.state.html.should.containEql '<p>yep.01 &nbsp;<a href="artsy.net">here is a link.</a></p><p>In 2016, K mounted a <span><a'

    it 'strips google inserted styles', ->
      @component.setState = sinon.stub()
      @component.onPaste('<b style="font-weight:normal;" id="docs-internal-guid-ce2bb19a-cddb-9e53-cb18-18e71847df4e"><p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Available at: Espacio Valverde • Galleries Sector, Booth 9F01</span></p>')
      @component.setState.args[0][0].html.should.containEql '<h2>Available at: Espacio Valverde • Galleries Sector, Booth 9F0101 &nbsp;'

    it 'calls standardizeSpacing', ->
      @SectionText.__set__ 'standardizeSpacing', standardizeSpacing = sinon.stub().returns('<p>hello</p><p>here again.</p>')
      component = ReactDOM.render React.createElement(@SectionText, @artistProps), (@$el = $ "<div></div>")[0]
      component.onPaste('hello here again.', '<p>hello</p><p>here again.</p>')
      standardizeSpacing.called.should.eql true

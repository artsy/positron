benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-dom/test-utils'
ReactDOMServer = require 'react-dom/server'
Draft = require 'draft-js'
{ EditorState, Modifier } = require 'draft-js'

r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'Rich Text: Paragraph', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
      window.jQuery = $
      global.Node = window.Node
      global.Element = window.Element
      global.HTMLElement = window.HTMLElement
      global.document = window.document
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
      @Paragraph = benv.require resolve __dirname, '../../components/paragraph'
      @Paragraph.__set__ 'Modifier', Modifier
      @Paragraph.__set__ 'EditorState', EditorState
      Config = require '../../utils/config.js'
      @Paragraph.__set__ 'Config', Config
      { TextNav } = benv.require(
        resolve(__dirname, '../../components/text_nav')
      )
      @Paragraph.__set__ 'TextNav', TextNav
      InputUrl = benv.requireWithJadeify(
        resolve(__dirname, '../../components/input_url'), ['icons']
      )
      @Paragraph.__set__ 'InputUrl', React.createFactory InputUrl
      @Paragraph.__set__ 'stickyControlsBox', sinon.stub().returns {top: 20, left: 40}
      @Paragraph.__set__ 'stripGoogleStyles', @stripGoogleStyles = sinon.stub().returns('<p>hello</p><p>here again.</p>')
      @leadParagraph = '<p>Here is  the <em>lead</em> paragraph for  <b>this</b> article.</p>'
      @postscript = '<p>Illustration by <a href="http://artsy.net">Tomi Um</a>.</p>'
      @props = {
        html: @postscript
        placeholder: 'Postscript (optional)'
        onChange: sinon.stub()
        linked: true
      }
      @component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], => setTimeout =>
        @component.stickyControlsBox = sinon.stub().returns {top: 20, left: 40}
        @component.state.editorState.getSelection().isCollapsed = sinon.stub().returns false
        selection = @component.state.editorState.getSelection()
        newSelection = selection.merge({
          anchorKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
          anchorOffset: 0
          focusKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
          focusOffset: 12
        })
        newEditorState = EditorState.acceptSelection(@component.state.editorState, newSelection)
        @component.onChange newEditorState
        done()

  afterEach ->
    benv.teardown()

  describe 'Render', ->

    it 'Shows a placeholder if provided and empty', ->
      component = ReactDOMServer.renderToString React.createElement(@Paragraph, @props)
      $(component).text().should.containEql 'Postscript (optional)'

    it 'Renders existing html', ->
      $(ReactDOM.findDOMNode(@component)).text().should.containEql 'Illustration by Tomi Um.'

    it 'Renders existing link entities', ->
      $(ReactDOM.findDOMNode(@component)).html().should.containEql '<a href="http://artsy.net/">'

  describe 'On change', ->
    it 'Sets the editorState and html on change', ->
      @component.setState = sinon.stub()
      r.simulate.click r.find @component, 'rich-text--paragraph__input'
      @component.setState.args[1][0].editorState.should.be.ok
      @component.setState.args[1][0].html.should.be.ok

    it 'Calls props.onChange if content has changed', ->
      @component.setState = sinon.stub()
      @component.handleKeyCommand('italic')
      @component.props.onChange.called.should.eql true

    it 'Does not call props.onChange if content has not changed', ->
      @component.setState = sinon.stub()
      r.simulate.click r.find @component, 'rich-text--paragraph__input'
      @component.props.onChange.called.should.eql false
      @component.setState.called.should.eql true

  describe 'Key commands', ->

    it 'Can toggle bold styles', ->
      @component.setState = sinon.stub()
      @component.handleKeyCommand('bold')
      @component.setState.args[0][0].html.should.containEql '<strong>Illustration</strong>'

    it 'Does not toggle bold if type is caption', ->
      @props.linked = null
      @props.type = 'caption'
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      component.setState = sinon.stub()
      component.handleKeyCommand('bold')
      component.setState.called.should.eql false

    it 'Can toggle italic styles', ->
      @component.setState = sinon.stub()
      @component.handleKeyCommand('italic')
      @component.setState.args[0][0].html.should.containEql '<em>Illustration</em>'

    it 'Does not toggle italic if type is postscript', ->
      @props.linked = null
      @props.type = 'postscript'
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      component.setState = sinon.stub()
      component.handleKeyCommand('italic')
      component.setState.called.should.eql false

    it 'Can toggle a link prompt', ->
      @component.setState = sinon.stub()
      @component.handleKeyCommand('link-prompt')
      @component.setState.args[0][0].selectionTarget.should.eql { top: 20, left: 40 }
      @component.setState.args[0][0].showUrlInput.should.eql true

  describe 'Nav', ->

    it 'Prints Italic and Bold buttons by default', ->
      @props.linked = null
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      r.simulate.mouseUp r.find component, 'rich-text--paragraph__input'
      $(ReactDOM.findDOMNode(component)).html().should.containEql '<button class="italic">I</button><button class="bold">B</button>'
      $(ReactDOM.findDOMNode(component)).html().should.not.containEql '<button class="link">'

    it 'Shows correct buttons if type unspecified and linked is true', ->
      r.simulate.mouseUp r.find @component, 'rich-text--paragraph__input'
      $(ReactDOM.findDOMNode(@component)).html().should.containEql(
        '<button class="italic">I</button><button class="bold">B</button><button class="link">'
      )

    it 'Does not show italic if type is postscript', ->
      @props.linked = null
      @props.type = 'postscript'
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      r.simulate.mouseUp r.find component, 'rich-text--paragraph__input'
      component.setState = sinon.stub()
      $(ReactDOM.findDOMNode(component)).html().should.containEql '<button class="bold">B</button><button class="link">'
      $(ReactDOM.findDOMNode(component)).html().should.not.containEql '<button class="italic">I</button>'

    it 'Does not show bold if type is caption', ->
      @props.linked = null
      @props.type = 'caption'
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      r.simulate.mouseUp r.find component, 'rich-text--paragraph__input'
      component.setState = sinon.stub()
      $(ReactDOM.findDOMNode(component)).html().should.containEql '<button class="italic">I</button><button class="link">'
      $(ReactDOM.findDOMNode(component)).html().should.not.containEql '<button class="bold">B</button>'

    it 'Can toggle bold styles', ->
      r.simulate.mouseUp r.find @component, 'rich-text--paragraph__input'
      @component.setState = sinon.stub()
      r.simulate.mouseDown r.find @component, 'bold'
      @component.setState.args[0][0].html.should.containEql '<strong>Illustration</strong>'

    it 'Can toggle italic styles', ->
      r.simulate.mouseUp r.find @component, 'rich-text--paragraph__input'
      @component.setState = sinon.stub()
      r.simulate.mouseDown r.find @component, 'italic'
      @component.setState.args[0][0].html.should.containEql '<em>Illustration</em>'

    it 'Can toggle a link prompt', ->
      r.simulate.mouseUp r.find @component, 'rich-text--paragraph__input'
      @component.setState = sinon.stub()
      r.simulate.mouseDown r.find @component, 'link'
      @component.setState.args[0][0].selectionTarget.should.eql { top: 20, left: 40 }
      @component.setState.args[0][0].showUrlInput.should.eql true

  describe 'Links', ->

    it '#hasLinks returns true if props.linked', ->
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      haslinks = component.hasLinks()
      haslinks.should.eql true

    it '#hasLinks returns true if type is postscript', ->
      @props.type = 'postscript'
      @props.linked = null
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      haslinks = component.hasLinks()
      haslinks.should.eql true

    it '#hasLinks returns true if type is caption', ->
      @props.type = 'caption'
      @props.linked = null
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      haslinks = component.hasLinks()
      haslinks.should.eql true

    it '#confirmLink can save a link as html', ->
      @component.confirmLink('http://artsy.net')
      (@component.state.html.match(/<a href=/g) || []).length.should.eql 2

  describe 'Linebreaks', ->

    it 'allows linebreaks by default', ->
      @props.html = '<p>Here one paragraph.</p><p>Here is second paragraph</p>'
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      $(ReactDOM.findDOMNode(component)).find('.public-DraftStyleDefault-block').length.should.eql 2

    it 'strips linebreaks if props.stripLinebreaks', ->
      @props.stripLinebreaks = true
      @props.html = '<p>Here one paragraph.</p><p>Here is second paragraph</p>'
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      $(ReactDOM.findDOMNode(component)).find('.public-DraftStyleDefault-block').length.should.eql 1

    it 'interrupts key command for linebreak if props.stripLinebreaks', ->
      @props.stripLinebreaks = true
      @props.html = '<p>Here one paragraph.</p><p>Here is second paragraph</p>'
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      keyResponse = component.handleKeyCommand('split-block')
      keyResponse.should.eql 'handled'

  describe '#onPaste', ->

    it 'calls stripGoogleStyles', ->
      @component.onChange = sinon.stub()
      @component.onPaste('hello here again.', '<p>hello</p><p>here again.</p>')
      @stripGoogleStyles.called.should.eql true

    xit 'calls standardizeSpacing', ->
      @component.onChange = sinon.stub()
      @component.onPaste('hello here again.', '<p>hello</p><p>here again.</p>')
      @component.standardizeSpacing.called.should.eql true

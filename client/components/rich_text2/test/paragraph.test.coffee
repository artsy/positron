benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
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
      global.Node = () => {}
      global.HTMLElement = () => {}
      global.HTMLAnchorElement = () => {}
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
      @Paragraph = benv.require resolve __dirname, '../components/paragraph'
      @Paragraph.__set__ 'Modifier', Modifier
      @Paragraph.__set__ 'EditorState', EditorState
      @Utils = benv.require resolve __dirname, '../utils'
      @Paragraph.__set__ 'Utils', @Utils
      Config = require '../utils/config.coffee'
      @Paragraph.__set__ 'Config', Config
      Nav = benv.requireWithJadeify(
        resolve(__dirname, '../components/nav'), ['icons']
      )
      @Paragraph.__set__ 'Nav', React.createFactory Nav
      InputUrl = benv.requireWithJadeify(
        resolve(__dirname, '../components/input_url'), ['icons']
      )
      @Paragraph.__set__ 'InputUrl', React.createFactory InputUrl
      @Paragraph.__set__ 'Utils.stickyControlsBox', sinon.stub().returns {top: 20, left: 40}
      @Paragraph.__set__ 'Utils.getSelectionLocation', sinon.stub().returns({top: 40, left: 20})
      @Paragraph.__set__ 'Utils.stripGoogleStyles', @stripGoogleStyles = sinon.stub().returns('<p>hello</p><p>here again.</p>')
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

  describe 'Key commands', ->

    it 'Can toggle bold styles', ->
      @component.setState = sinon.stub()
      @component.handleKeyCommand('bold')
      @component.setState.args[0][0].html.should.containEql '<strong>Illustration</strong>'

    it 'Can toggle italic styles', ->
      @component.setState = sinon.stub()
      @component.handleKeyCommand('italic')
      @component.setState.args[0][0].html.should.containEql '<em>Illustration</em>'

    it 'Can toggle a link prompt', ->
      @component.setState = sinon.stub()
      @component.handleKeyCommand('link-prompt')
      @component.setState.args[0][0].selectionTarget.should.eql { top: 20, left: 40 }
      @component.setState.args[0][0].showUrlInput.should.eql true

  describe 'Nav', ->

    it 'Prints Italic and Bold buttons by default', ->
      @props.linked = null
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      component.setState showNav: true
      $(ReactDOM.findDOMNode(component)).html().should.containEql '<button name="ITALIC" class="ITALIC">I</button><button name="BOLD" class="BOLD">B</button>'
      $(ReactDOM.findDOMNode(component)).html().should.not.containEql '<button name="link" class="link">'

    it 'Shows correct buttons if type unspecified and linked is true', ->
      @component.setState showNav: true
      $(ReactDOM.findDOMNode(@component)).html().should.containEql '<button name="ITALIC" class="ITALIC">I</button><button name="BOLD" class="BOLD">B</button><button name="link" class="link">'

    it 'Does not show italic if type is postscript', ->
      @props.linked = null
      @props.type = 'postscript'
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      component.setState showNav: true
      $(ReactDOM.findDOMNode(component)).html().should.containEql '<button name="BOLD" class="BOLD">B</button><button name="link" class="link">'
      $(ReactDOM.findDOMNode(component)).html().should.not.containEql '<button name="ITALIC" class="ITALIC">I</button>'

    it 'Does not show bold if type is caption', ->
      @props.linked = null
      @props.type = 'caption'
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      component.setState showNav: true
      $(ReactDOM.findDOMNode(component)).html().should.containEql '<button name="ITALIC" class="ITALIC">I</button><button name="link" class="link">'
      $(ReactDOM.findDOMNode(component)).html().should.not.containEql '<button name="BOLD" class="BOLD">B</button>'

    it 'Can toggle bold styles', ->
      @component.setState showNav: true
      @component.setState = sinon.stub()
      r.simulate.mouseDown r.find @component, 'BOLD'
      @component.setState.args[0][0].html.should.containEql '<strong>Illustration</strong>'

    it 'Can toggle italic styles', ->
      @component.setState showNav: true
      @component.setState = sinon.stub()
      r.simulate.mouseDown r.find @component, 'ITALIC'
      @component.setState.args[0][0].html.should.containEql '<em>Illustration</em>'

    it 'Can toggle a link prompt', ->
      @component.setState showNav: true
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
      $(ReactDOM.findDOMNode(component)).find('p').length.should.eql 2

    it 'strips linebreaks if props.stripLinebreaks', ->
      @props.stripLinebreaks = true
      @props.html = '<p>Here one paragraph.</p><p>Here is second paragraph</p>'
      component = ReactDOM.render React.createElement(@Paragraph, @props), (@$el = $ "<div></div>")[0], =>
      $(ReactDOM.findDOMNode(component)).find('p').length.should.eql 1

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

    it 'calls standardizeSpacing', ->
      @Utils.standardizeSpacing = sinon.stub()
      @component.onChange = sinon.stub()
      @component.onPaste('hello here again.', '<p>hello</p><p>here again.</p>')
      @Utils.standardizeSpacing.called.should.eql true

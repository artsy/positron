benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'

# FIXME: Invariant Violation: dangerouslyReplaceNodeWithMarkup(...): Cannot render markup in a worker thread. Make sure `window` and `document` are available globally before requiring React when unit testing or use ReactDOMServer.renderToString() for server rendering.
describe.skip 'RichTextParagraph', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        React: require 'react'
        ReactDOM: require 'react-dom'
        ReactTestUtils: require 'react-addons-test-utils'
        ReactDOMServer: require 'react-dom/server'
        Draft: require 'draft-js'
      window.jQuery = $
      @r =
        find: ReactTestUtils.findRenderedDOMComponentWithClass
        simulate: ReactTestUtils.Simulate
      @d =
        EditorState: Draft.EditorState
      global.HTMLElement = () => {}
      global.HTMLAnchorElement = () => {}
      @RichTextParagraph = benv.require resolve __dirname, '../components/input_paragraph'
      @props = {
        text: '<p>Here is  the <em>lead</em> paragraph for  <b>this</b> article.</p>'
        placeholder: 'Lead paragraph (optional)'
        onChange: sinon.stub()
        }
      @rendered = ReactDOMServer.renderToString React.createElement(@RichTextParagraph, @props)

      @component = ReactDOM.render React.createElement(@RichTextParagraph, @props), (@$el = $ "<div></div>")[0], => setTimeout =>
        @component.state.editorState.getSelection().isCollapsed = sinon.stub().returns false
        selection = @component.state.editorState.getSelection()
        newSelection = selection.merge({
          anchorKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
          anchorOffset: 0
          focusKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
          focusOffset: 7
        })
        newEditorState = @d.EditorState.acceptSelection(@component.state.editorState, newSelection)
        @component.onChange newEditorState
        done()

  afterEach ->
    benv.teardown()

  it 'Shows a placeholder if provided and empty', ->
    $(@rendered).text().should.eql 'Lead paragraph (optional)'

  it 'Renders an existing lead paragraph', ->
    $(ReactDOM.findDOMNode(@component)).text().should.eql 'Here is  the lead paragraph for  this article.'
    @component.state.html.should.eql '<p>Here is &nbsp;the <em>lead</em> paragraph for &nbsp;<strong>this</strong> article.</p>'

  it 'Can toggle bold styles by default', ->
    @component.handleKeyCommand('bold')
    @component.state.html.should.eql '<p><strong>Here is</strong> &nbsp;the <em>lead</em> paragraph for &nbsp;<strong>this</strong> article.</p>'

  it 'Can toggle italic styles by default', ->
    @component.handleKeyCommand('italic')
    @component.state.html.should.eql '<p><em>Here is</em> &nbsp;the <em>lead</em> paragraph for &nbsp;<strong>this</strong> article.</p>'

  it 'Ignores unsuppored styles', ->
    @component.handleKeyCommand('underline')
    @component.state.html.should.eql '<p>Here is &nbsp;the <em>lead</em> paragraph for &nbsp;<strong>this</strong> article.</p>'

  it 'Can override default styles via props.styleMap', ->
    @props.styleMap = ['bold']
    @props.text = '<p>Here is the a paragraph for <b>this</b> article.</p>'
    component = ReactDOM.render React.createElement(@RichTextParagraph, @props), (@$el = $ "<div></div>")[0]
    component.state.editorState.getSelection().isCollapsed = sinon.stub().returns false
    selection = component.state.editorState.getSelection()
    newSelection = selection.merge({
      anchorKey: component.state.editorState.getCurrentContent().getFirstBlock().key
      anchorOffset: 0
      focusKey: component.state.editorState.getCurrentContent().getFirstBlock().key
      focusOffset: 7
    })
    newEditorState = @d.EditorState.acceptSelection(component.state.editorState, newSelection)
    component.onChange newEditorState

    component.handleKeyCommand('italic')
    component.state.html.should.eql '<p>Here is the a paragraph for <strong>this</strong> article.</p>'

    component.handleKeyCommand('bold')
    component.state.html.should.eql '<p><strong>Here is</strong> the a paragraph for <strong>this</strong> article.</p>'

  it 'Strips unsuported html out of pasted text', ->
    @component.onPaste 'Available at: Espacio Valverde Galleries Sector, Booth 9F01', '<b style="font-weight:normal;" id="docs-internal-guid-ce2bb19a-cddb-9e53-cb18-18e71847df4e"><h1><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Available at: Espacio Valverde • Galleries Sector, Booth 9F01</span></h1>'
    @component.state.html.should.eql '<p>Available at: Espacio Valverde • Galleries Sector, Booth 9F01 &nbsp;the <em>lead</em> paragraph for &nbsp;<strong>this</strong> article.</p>'

  it 'Sends converted html to parent onChange', ->
    @component.onChange @component.state.editorState
    @component.props.onChange.called.should.eql true
    @component.props.onChange.args[0][0].should.eql '<p>Here is &nbsp;the <em>lead</em> paragraph for &nbsp;<strong>this</strong> article.</p>'

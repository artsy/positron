benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'

describe 'RichTextCaption', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        React: require 'react'
        ReactDOM: require 'react-dom'
        ReactTestUtils: require 'react-addons-test-utils'
        Draft: require 'draft-js'
      window.jQuery = $
      window.getSelection = sinon.stub().returns(
        isCollapsed: false, getRangeAt: sinon.stub().returns(
          getClientRects: sinon.stub().returns([width: 20, top: 20, left: 20])
        )
      )
      @r =
        find: ReactTestUtils.scryRenderedDOMComponentsWithClass
        simulate: ReactTestUtils.Simulate
      @d =
        EditorState: Draft.EditorState
      global.HTMLElement = () => {}
      global.HTMLAnchorElement = () => {}
      @RichTextCaption = benv.requireWithJadeify resolve(__dirname, '../../rich_text_caption/index'), ['icons']
      InputUrl = benv.requireWithJadeify(
        resolve(__dirname, '../../rich_text/components/input_url'), ['icons']
      )
      @RichTextCaption.__set__ 'InputUrl', React.createFactory InputUrl
      @props = {
        item:
          {
            type: 'image'
            url: 'https://artsy.net/image.png'
            caption: '<p><a href="http://link.com">A link</a> is  inside a  <em>caption</em>.</p>'
          }
        editing: true
      }
      @component = ReactDOM.render React.createElement(@RichTextCaption, @props), (@$el = $ "<div></div>")[0], => setTimeout =>
        @component.stickyLinkBox = sinon.stub().returns {top: 20, left: 40}
        # a second component with preselected text
        @selectComponent = ReactDOM.render React.createElement(@RichTextCaption, @props), (@$el = $ "<div></div>")[0]
        @selectComponent.stickyLinkBox = sinon.stub().returns {top: 20, left: 40}
        @selectComponent.state.editorState.getSelection().isCollapsed = sinon.stub().returns false
        selection = @selectComponent.state.editorState.getSelection()
        newSelection = selection.merge({
          anchorKey: @selectComponent.state.editorState.getCurrentContent().getFirstBlock().key
          anchorOffset: 0
          focusKey: @selectComponent.state.editorState.getCurrentContent().getFirstBlock().key
          focusOffset: 6
        })
        newEditorState = @d.EditorState.acceptSelection(@selectComponent.state.editorState, newSelection)
        @selectComponent.onChange newEditorState
        done()

  afterEach ->
    benv.teardown()

  it 'Shows a placeholder if caption is empty', ->
    @props.item.caption = ''
    component = ReactDOM.render React.createElement(@RichTextCaption, @props), (@$el = $ "<div></div>")[0]
    $(ReactDOM.findDOMNode(component)).html().should.containEql 'Media caption'

  it 'Renders an existing caption', ->
    @component.onChange(@component.state.editorState)
    @component.state.html.should.eql '<p><a href="http://link.com/">A link</a> is &nbsp;inside a &nbsp;<em>caption</em>.</p>'

  it 'Shows a menu if text is selected', ->
    @r.simulate.mouseUp @r.find(@selectComponent, 'rich-text--caption__input')[0]
    $(ReactDOM.findDOMNode(@selectComponent)).html().should.containEql 'rich-text--caption__actions'
    $(ReactDOM.findDOMNode(@selectComponent)).html().should.containEql '<button class="italic">'
    $(ReactDOM.findDOMNode(@selectComponent)).html().should.containEql '<button class="link">'

  it 'Opens a link input popup on click', ->
    @r.simulate.mouseUp @r.find(@selectComponent, 'rich-text--caption__input')[0]
    @r.simulate.mouseDown @r.find(@selectComponent, 'link')[0]
    $(ReactDOM.findDOMNode(@selectComponent)).html().should.containEql 'rich-text--url-input'

  it 'Opens a link input popup on key command', ->
    @selectComponent.setState = sinon.stub()
    @selectComponent.handleKeyCommand('link-prompt')
    @selectComponent.setState.args[0][0].showUrlInput.should.eql true

  it 'Can remove an existing link', ->
    @r.simulate.mouseUp @r.find(@selectComponent, 'rich-text--caption__input')[0]
    @r.simulate.mouseDown @r.find(@selectComponent, 'link')[0]
    @selectComponent.state.urlValue.should.eql 'http://link.com/'
    @r.simulate.mouseDown @r.find(@selectComponent, 'remove-link')[0]
    @selectComponent.state.urlValue.should.eql ''
    @selectComponent.state.showUrlInput.should.eql false

  it 'Can create italic blocks on click', ->
    @r.simulate.mouseUp @r.find(@selectComponent, 'rich-text--caption__input')[0]
    @r.simulate.mouseDown @r.find(@selectComponent, 'italic')[0]
    @selectComponent.state.html.should.eql '<p><em><a href="http://link.com/">A link</a></em> is &nbsp;inside a &nbsp;<em>caption</em>.</p>'

  it 'Can create italic blocks on key command', ->
    @selectComponent.setState = sinon.stub()
    @selectComponent.handleKeyCommand('italic')
    @selectComponent.setState.args[0][0].html.should.eql '<p><em><a href="http://link.com/">A link</a></em> is &nbsp;inside a &nbsp;<em>caption</em>.</p>'

  it 'Strips unsupported html and linebreaks on paste', ->
    @component.onPaste('Here is a caption about an image yep.', '<p>Here is a</p><ul><li><b>caption</b></li><li>about an image</li></ul><p>yep.</p>')
    @component.state.html.should.eql '<p>Here is a caption about an image yep.<a href="http://link.com/">A link</a> is &nbsp;inside a &nbsp;<em>caption</em>.</p>'

  it 'does not save empty captions', ->
    @component.props.item.caption = '<p></p>'
    @component.componentDidMount()
    @component.onChange(@component.state.editorState)
    @component.state.html.should.eql ''



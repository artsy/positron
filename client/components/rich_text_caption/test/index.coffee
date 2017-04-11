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
      @r =
        find: ReactTestUtils.findRenderedDOMComponentWithClass
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

  it 'Opens a link input popup', ->
    @r.simulate.mouseDown @r.find @component, 'link'
    @component.state.showUrlInput.should.eql true

  it 'Can remove an existing link', ->
    @r.simulate.mouseDown @r.find @selectComponent, 'link'
    @selectComponent.state.urlValue.should.eql 'http://link.com/'
    @r.simulate.mouseDown @r.find @selectComponent, 'remove-link'
    @selectComponent.state.urlValue.should.eql ''
    @selectComponent.state.showUrlInput.should.eql false

  it 'Can create italic blocks', ->
    @r.simulate.mouseDown @r.find @selectComponent, 'italic'
    @selectComponent.state.html.should.eql '<p><em><a href="http://link.com/">A link</a></em> is &nbsp;inside a &nbsp;<em>caption</em>.</p>'

  it 'Strips unsupported html and linebreaks on paste', ->
    @component.onPaste('Here is a caption about an image yep.', '<p>Here is a</p><ul><li><b>caption</b></li><li>about an image</li></ul><p>yep.</p>')
    @component.state.html.should.eql '<p>Here is a caption about an image yep.<a href="http://link.com/">A link</a> is &nbsp;inside a &nbsp;<em>caption</em>.</p>'


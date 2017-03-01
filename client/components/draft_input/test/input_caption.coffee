benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'

describe 'DraftInputCaption', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        React: require 'react'
        ReactDOM: require 'react-dom'
        ReactTestUtils: require 'react-addons-test-utils'
        ReactDOMServer: require 'react-dom/server'
      window.jQuery = $
      @r =
        find: ReactTestUtils.findRenderedDOMComponentWithClass
        simulate: ReactTestUtils.Simulate
      global.HTMLElement = () => {}
      global.HTMLAnchorElement = () => {}
      DraftInputCaption = benv.requireWithJadeify resolve(__dirname, '../components/input_caption'), ['icons']
      props = {
        item:
          {
            type: 'image'
            url: 'https://artsy.net/image.png'
            caption: '<p>Here <a href="http://link.com">is</a> a <em>caption</em>.</p>'
          }
        }
      @rendered = ReactDOMServer.renderToString React.createElement(DraftInputCaption, props)
      @component = ReactDOM.render React.createElement(DraftInputCaption, props), (@$el = $ "<div></div>")[0], => setTimeout =>
        done()

  afterEach ->
    benv.teardown()

  it 'Shows a placeholder if caption is empty', ->
    $(@rendered).html().should.containEql 'Image caption'

  it 'Renders an existing caption', ->
    @component.onChange(@component.state.editorState)
    @component.state.html.should.eql '<p>Here is a <em>caption</em>.</p>'

  it 'Opens a link input popup', ->
    @r.simulate.mouseDown @r.find @component, 'link'
    @component.state.showUrlInput.should.eql true

  xit 'Can remove a link', ->

  xit 'Can create italic blocks', ->

  it 'Strips unsupported html and linebreaks', ->
    @component.onPaste('Here is a caption about an image yep.', '<p>Here is a</p><ul><li><b>caption</b></li><li>about an image</li></ul><p>yep.</p>')
    @component.state.html.should.eql '<p>Here is a caption about an image yep.Here is a <em>caption</em>.</p>'
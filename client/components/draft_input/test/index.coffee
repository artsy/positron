benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'

r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'DraftInputCaption', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      global.HTMLElement = () => {}
      global.HTMLAnchorElement = () => {}
      DraftInputCaption = benv.require resolve(__dirname, '../draft_input_caption')
      props = {
        item:
          {
            type: 'image'
            url: 'https://artsy.net/image.png'
            caption: '<p>Here <a href="link">is</a> a <em>caption</em>.</p>'
          }
        }
      @rendered = ReactDOMServer.renderToString React.createElement(DraftInputCaption, props)
      @component = ReactDOM.render React.createElement(DraftInputCaption, props), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'Shows a placeholder if caption is empty', ->
    $(@rendered).html().should.containEql 'Image caption'

  it 'Renders and existing caption', ->
    @component.onChange(@component.state.editorState)
    @component.setState.args[0][0].html.should.eql '<p>Here is a <em>caption</em>.</p>'

  xit 'Can add a link', ->
    r.simulate.mouseDown r.find @component, 'link'
    @component.promptForLink.called.should.eql true
    @component.state.showUrlInput.should.eql true

  xit 'Can remove a link', ->

  xit 'Can create italic blocks', ->

  it 'Strips unsupported html and linebreaks', ->
    @component.onPaste('Here is a caption about an image yep.', '<p>Here is a</p><ul><li><b>caption</b></li><li>about an image</li></ul><p>yep.</p>')
    @component.setState.args[0][0].html.should.eql '<p>Here is a caption about an image yep.Here is a <em>caption</em>.</p>'
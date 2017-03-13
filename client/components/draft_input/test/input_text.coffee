benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'
Backbone = require 'backbone'

describe 'DraftInputText', ->

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
      DraftInputText = benv.requireWithJadeify resolve(__dirname, '../components/input_text'), ['icons']
      props = {
        section: new Backbone.Model {
            body: '<p>In 2016, K mounted a <a href="https://www.artsy.net/show/kow-hiwa-k-this-lemon-tastes-of-apple" target="_blank">solo show</a> at prescient Berlin gallery <a href="https://www.artsy.net/kow" target="_blank">KOW</a>, restaging his installation <i>It’s Spring and the Weather is Great so let’s close all object matters</i> (2012), for which he created seven step ladders with microphones and instruments attached for a performance initially meant to take place at Speakers’ Corner in London’s Hyde Park that was eventually mounted in 2010 at the <a href="https://www.artsy.net/serpentineuk" target="_blank">Serpentine Galleries</a>.</p><p><br></p><br>'
          }
        }
      @rendered = ReactDOMServer.renderToString React.createElement(DraftInputText, props)
      @component = ReactDOM.render React.createElement(DraftInputText, props), (@$el = $ "<div></div>")[0], => setTimeout =>
        done()

  afterEach ->
    benv.teardown()

  it 'Converts an existing body', ->
  	console.log @component.state.editorState
    # console.log $(@rendered).html()

  it 'Renders an existing body', ->
    @component.onChange(@component.state.editorState)
    @component.state.html.should.eql '<p>In 2016, K mounted a <a href="https://www.artsy.net/show/kow-hiwa-k-this-lemon-tastes-of-apple">solo show</a> at prescient Berlin gallery <a href="https://www.artsy.net/kow">KOW</a>, restaging his installation <em>It’s Spring and the Weather is Great so let’s close all object matters</em> (2012), for which he created seven step ladders with microphones and instruments attached for a performance initially meant to take place at Speakers’ Corner in London’s Hyde Park that was eventually mounted in 2010 at the <a href="https://www.artsy.net/serpentineuk">Serpentine Galleries</a>.</p><p><br></p><p></p>'

  xit 'Opens a link input popup', ->
    @r.simulate.mouseDown @r.find @component, 'link'
    @component.state.showUrlInput.should.eql true

  xit 'Can remove a link', ->

  xit 'Can create italic blocks', ->

  xit 'Strips unsupported html and linebreaks', ->
    @component.onPaste('Here is a caption about an image yep.', '<p>Here is a</p><ul><li><b>caption</b></li><li>about an image</li></ul><p>yep.</p>')
    @component.state.html.should.eql '<p>Here is a caption about an image yep.Here is a <em>caption</em>.</p>'
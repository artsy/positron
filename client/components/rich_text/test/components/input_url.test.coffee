benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'

describe 'RichTextInputUrl', ->

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
      global.Node = window.Node
      global.Element = window.Element
      global.HTMLElement = window.HTMLElement
      global.document = window.document
      DraftInputUrl = benv.requireWithJadeify resolve(__dirname, '../../components/input_url'), ['icons']
      props = {
        selectionTarget:
          { top: 20, left: 20 }
        urlValue: 'http://artsy.net'
        confirmLink: sinon.stub()
        removeLink: sinon.stub()
        }
      @rendered = ReactDOMServer.renderToString React.createElement(DraftInputUrl, props)
      @component = ReactDOM.render React.createElement(DraftInputUrl, props), (@$el = $ "<div></div>")[0], => setTimeout =>
        done()

  afterEach ->
    benv.teardown()

  it 'Shows a placeholder when creating a new link', ->
    $(@rendered).html().should.containEql 'Paste or type a link'

  it 'Renders an existing url when editing an existing link', ->
    @component.refs.url.value.should.containEql 'http://artsy.net'

  it 'Can input a link', ->
    @component.refs.url.value = 'http://artsy.net/articles'
    @component.onChange()
    @r.simulate.mouseDown @r.find @component, 'add-link'
    @component.props.confirmLink.args[0][0].should.eql 'http://artsy.net/articles'

  it 'Can remove a link', ->
    @r.simulate.mouseDown @r.find @component, 'remove-link'
    @component.props.removeLink.called.should.eql true

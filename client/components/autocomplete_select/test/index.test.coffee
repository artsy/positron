benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'

describe 'AutocompleteSelect', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        Bloodhound: (@Bloodhound = sinon.stub()).returns(
          initialize: ->
          ttAdapter: ->
        )
      $.fn.typeahead = sinon.stub()
      { AutocompleteSelect } = mod = benv.require resolve __dirname, '../index'
      mod.__set__ 'request', get: sinon.stub().returns
        set: sinon.stub().returns
          end: sinon.stub().yields(null, { id: '123', value: 'Andy Warhol'})
      props =
        url: 'https://api.artsy.net/search?term=%QUERY'
        placeholder: 'Search for an artist...'
        filter: @filter = sinon.stub()
        selected: @selected = sinon.stub()
        removed: @removed = sinon.stub()
        idToFetch: '123'
        fetchUrl: (id) -> 'https://api.artsy.net/search/' + id
        resObject: (res) -> id: res.id, value: res.value
      @rendered = ReactDOMServer.renderToString React.createElement(AutocompleteSelect, props)
      @component = ReactDOM.render React.createElement(AutocompleteSelect, props), (@$el = $ "<div></div>")[0], => setTimeout =>
        @setState = sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'renders fetched items', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Andy Warhol'

  it 'initializes autocomplete with args', ->
    @Bloodhound.args[0][0].remote.url.should.equal 'https://api.artsy.net/search?term=%QUERY'

  it 'removes an item', ->
    @component.removeItem()
    (@setState.args[0][0].value?).should.be.false()
    (@setState.args[0][0].id?).should.be.false()

  it 'selects an item', ->
    @component.onSelect {}, { id: '1234', value: 'Yayoi Kusama' }
    @setState.args[0][0].value.should.equal 'Yayoi Kusama'
    @setState.args[0][0].id.should.equal '1234'
    @selected.callCount.should.equal 1

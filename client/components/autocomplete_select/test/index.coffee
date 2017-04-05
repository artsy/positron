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
      benv.expose $: benv.require 'jquery'
      { AutocompleteSelect } = mod = benv.require resolve __dirname, '../index'
      @component = ReactDOM.render React.createElement(AutocompleteSelect,
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'adds an autocomplete component that when selected updates value state', ->
    @component.addAutocomplete()
    @Autocomplete.args[0][0].selected({}, { value: 'Moo' })
    @component.setState.args[0][0].value.should.equal 'Moo'
benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'

describe 'AutocompleteSelect', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      { AutocompleteSelect } = mod = benv.require resolve __dirname, '../index'
      mod.__set__ 'Autocomplete', @Autocomplete = sinon.stub()
      @component = React.render AutocompleteSelect(
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'adds an autocomplete component that when selected updates value state', ->
    @component.addAutocomplete()
    @Autocomplete.args[0][0].selected({}, { value: 'Moo' })
    @component.setState.args[0][0].value.should.equal 'Moo'
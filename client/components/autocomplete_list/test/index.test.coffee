benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-dom/test-utils'
ReactDOMServer = require 'react-dom/server'
r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  simulate: ReactTestUtils.Simulate

describe 'AutocompleteList', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        Bloodhound: (@Bloodhound = sinon.stub()).returns(
          initialize: ->
          ttAdapter: ->
        )
      $.fn.typeahead = sinon.stub()
      window.matchMedia = sinon.stub().returns({
        matches: sinon.stub()
      })
      @AutocompleteList = benv.require resolve __dirname, '../index'
      @AutocompleteList.__set__ 'request', get: sinon.stub().returns
        set: set = sinon.stub()
      set.onCall(0).returns
        end: sinon.stub().yields(null, { id: '123', value: 'Andy Warhol'})
      set.onCall(1).returns
        end: sinon.stub().yields(null, { id: '456', value: 'Mary Heilmann'})
      DragContainer = benv.require resolve __dirname, '../../drag_drop/index'
      DragTarget = benv.require resolve __dirname, '../../drag_drop/drag_target'
      DragSource = benv.require(resolve(__dirname, '../../drag_drop/drag_source.jsx')).DragSource
      DragContainer.__set__ 'DragTarget', React.createFactory DragTarget
      DragContainer.__set__ 'DragSource', DragSource
      @AutocompleteList.__set__ 'DragContainer', React.createFactory DragContainer
      @props =
        url: 'https://api.artsy.net/search?term=%QUERY'
        placeholder: 'Search for an artist...'
        filter: @filter = sinon.stub()
        selected: @selected = sinon.stub()
        removed: @removed = sinon.stub()
        idsToFetch: ['123', '456']
        fetchUrl: (id) -> 'https://api.artsy.net/search/' + id
        resObject: (res) -> id: res.id, value: res.value
        draggable: true
      @component = ReactDOM.render React.createElement(@AutocompleteList, @props), (@$el = $ "<div></div>")[0], => setTimeout =>
        @setState = sinon.stub @component, 'setState'
        done()

  afterEach (done) ->
    benv.teardown()
    done()

  it 'renders fetched items', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Andy Warhol'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'value="123"'

  it 'initializes autocomplete with args', ->
    @Bloodhound.args[0][0].remote.url.should.equal 'https://api.artsy.net/search?term=%QUERY'

  it 'selects an item', (done) ->
    @component.onSelect {}, { id: '1234', value: 'Yayoi Kusama' }
    @setState.args[0][0].items[0].value.should.equal 'Andy Warhol'
    @setState.args[0][0].items[2].value.should.equal 'Yayoi Kusama'
    @selected.callCount.should.equal 1
    done()

  it 'removes an item', (done) ->
    @component.removeItem({ id: '123', value: 'Andy Warhol' })({preventDefault: ->})
    @setState.args[0][0].items.length.should.equal 1
    @removed.callCount.should.equal 1
    done()

  it 'Accepts an inline option', (done) ->
    @props.inline = true
    rendered = ReactDOMServer.renderToString React.createElement(@AutocompleteList, @props)
    rendered.should.containEql 'autocomplete-container--inline'
    rendered.should.not.containEql '<div class="drag-container">'
    rendered.should.not.containEql 'draggable="true"'
    done()

  it 'Accepts a draggable option', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql '<div class="drag-container">'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'draggable="true"'

  it 'Resets the item order onDragEnd', (done) ->
    r.simulate.dragStart r.find(@component, 'DragSource')[1]
    r.simulate.dragOver r.find(@component, 'drag-target')[0]
    r.simulate.dragEnd r.find(@component, 'DragSource')[1]
    @selected.args[0][2][0].value.should.eql 'Mary Heilmann'
    done()

  it 'Disables draggable if no @props.draggable', (done) ->
    @props.draggable = false
    rendered = ReactDOMServer.renderToString React.createElement(@AutocompleteList, @props)
    rendered.should.not.containEql '<div class="drag-container">'
    rendered.should.not.containEql 'draggable="true"'
    done()

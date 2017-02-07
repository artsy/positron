benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'

Section = require '../../../../../models/section.coffee'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate
# { div } = React.DOM
fixtures = require '../../../../../../test/helpers/fixtures'
{ fabricate } = require 'antigravity'

describe 'SectionArtworks', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      SectionArtworks = benv.requireWithJadeify(
        resolve(__dirname, '../index')
        ['icons']
      )
      SectionArtworks.__set__ 'Autocomplete', sinon.stub()
      @component = ReactDOM.render React.createElement(SectionArtworks, {
        section: new Section { body: 'Foo to the bar', ids: [] }
        editing: false
        setEditing: ->
        changeLayout: ->
      }), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        sinon.stub @component, 'forceUpdate'
        sinon.stub Backbone, 'sync'
        done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown()

  it 'removes an artwork on click', ->
    @component.props.section.artworks.off()
    @component.props.section.artworks.reset [
      { id: '1', title: 'Baz'}
      a = { id: '2', title: 'Foo' }
      { id: '3', title: 'Bar'}
    ]
    @component.removeArtwork(@component.props.section.artworks.at 1)()
    @component.props.section.artworks.length.should.equal 2

  it 'destroys the section when clicking off with no artworks', ->
    @component.props.section.artworks.reset()
    @component.props.section.on 'destroy', spy = sinon.spy()
    @component.onClickOff()
    spy.called.should.be.ok

  it 'fetches artworks on init', ->
    @component.props.section.set ids: ['foo', 'bar']
    @component.componentDidMount()
    Backbone.sync.args[0][1].url().should.containEql 'foo'
    Backbone.sync.args[1][1].url().should.containEql 'bar'

  it 'adds fillwidth styling if the layout is appropriate', ->
    @component.props.section.artworks.reset [fixtures().artworks]
    @component.render
    @component.fillwidth = sinon.stub()
    @component.props.section.set layout: 'overflow_fillwidth'
    @component.componentDidUpdate()
    @component.fillwidth.called.should.be.ok

  it 'adds removes styling if the layout is appropriate', ->
    @component.props.section.set layout: 'overflow_fillwidth'
    @component.props.section.artworks.reset [fixtures().artworks]
    @component.removeFillwidth = sinon.stub()
    @component.props.section.set layout: 'column_width'
    @component.componentDidUpdate()
    @component.removeFillwidth.called.should.be.ok

  it 'changes layout when clicking on layout controls', ->
    r.simulate.click r.find @component, 'esa-overflow-fillwidth'
    @component.props.section.get('layout').should.equal 'overflow_fillwidth'

  xit 'renders the artworks', ->
    @component.state.artworks = [
      { id: '1', title: 'Foo to the bar' }
    ]
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Foo to the bar'

  it 'adds an artwork onSelect', ->
    @component.onSelect({},{ id: 'foo-work', value: 'Foo Title' })
    Backbone.sync.args[0][2].success fabricate 'artwork'
    @component.props.section.artworks.length.should.be.above 0
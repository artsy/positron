benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
Section = require '../../../../../models/section.coffee'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate
{ div } = React.DOM
fixtures = require '../../../../../../test/helpers/fixtures'

describe 'SectionArtworks', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: require 'jquery'
      SectionArtworks = benv.requireWithJadeify(
        resolve(__dirname, '../index')
        ['icons']
      )
      @component = React.render SectionArtworks(
        section: new Section { body: 'Foo to the bar', ids: [] }
        editing: false
        setEditing: ->
        changeLayout: ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
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

  it 'sets artwork ids when clicking off', ->
    @component.props.section.artworks.reset [
      { id: 'foo', title: 'Foo' }
      { id: 'bar', title: 'Bar'}
    ]
    @component.onClickOff()
    @component.props.section.get('ids').should.containEql 'foo', 'bar'

  it 'fetches artworks on init', ->
    @component.props.section.set ids: ['foo', 'bar']
    @component.componentDidMount()
    Backbone.sync.args[0][2].data.ids.should.containEql 'foo', 'bar'

  xit 'adds fillwidth styling if the layout is appropriate', ->
    @component.props.section.artworks.reset [fixtures().artworks]
    @component.render()
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
    $(@component.getDOMNode()).html().should.containEql 'Foo to the bar'
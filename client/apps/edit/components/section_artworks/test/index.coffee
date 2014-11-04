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
        section: new Section { body: 'Foo to the bar' }
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

  it 'adds artworks from urls', ->
    @component.state.urlsValue = 'artsy.net/foo\nartsy.net/baz'
    @component.state.artworks = []
    @component.addArtworksFromUrls (preventDefault: ->)
    Backbone.sync.args[0][2].data.ids[0].should.equal 'foo'
    Backbone.sync.args[0][2].success results: artworks = [fixtures().artworks]
    @component.setState.args[0][0].loadingUrls.should.equal true
    @component.setState.args[1][0].loadingUrls.should.equal false
    @component.setState.args[1][0].artworks[0].artwork.title
      .should.equal artworks[0].artwork.title

  it 'removes an artwork on click', ->
    @component.state.artworks = [
      { id: '1', title: 'Baz'}
      a = { id: '2', title: 'Foo' }
      { id: '3', title: 'Bar'}
    ]
    @component.removeArtwork(a)()
    @component.setState.args[0][0].artworks.length.should.equal 2
    @component.setState.args[0][0].artworks[1].title.should.equal 'Bar'

  it 'sets artwork ids when clicking off', ->
    @component.state.artworks = [{ artwork: id: 'foo'}, { artwork: id: 'bar'}]
    @component.onClickOff()
    @component.props.section.get('ids').should.containEql 'foo', 'bar'

  it 'fetches artworks on init', ->
    @component.props.section.set ids: ['foo', 'bar']
    @component.componentDidMount()
    Backbone.sync.args[0][2].data.ids.should.containEql 'foo', 'bar'

  it 'adds fillwidth styling if the layout is appropriate', ->
    @component.state.artworks = [fixtures().artworks]
    @component.fillwidth = sinon.stub()
    @component.props.section.set layout: 'overflow_fillwidth'
    @component.componentDidUpdate()
    @component.fillwidth.called.should.be.ok

  it 'adds removes styling if the layout is appropriate', ->
    @component.state.artworks = [fixtures().artworks]
    @component.removeFillwidth = sinon.stub()
    @component.props.layout = 'column_width'
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
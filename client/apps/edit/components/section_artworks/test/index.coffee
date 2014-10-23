benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
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
      @component = React.renderComponent SectionArtworks(
        section: new Backbone.Model { body: 'Foo to the bar' }
        editing: false
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        sinon.stub $, 'ajax'
        done()

  afterEach ->
    $.ajax.restore()
    benv.teardown()

  it 'adds artworks from urls', ->
    @component.state.urlsValue = 'artsy.net/foo\nartsy.net/baz'
    @component.state.artworks = []
    @component.addArtworksFromUrls (preventDefault: ->)
    $.ajax.args[0][0].data.ids[0].should.equal 'foo'
    $.ajax.args[0][0].success artworks = [fixtures().artworks]
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
    $.ajax.args[0][0].data.ids.should.containEql 'foo', 'bar'

  xit 'renders the artworks', ->
    @component.state.artworks = [
      { id: '1', title: 'Foo to the bar' }
    ]
    $(@component.getDOMNode()).html().should.containEql 'Foo to the bar'
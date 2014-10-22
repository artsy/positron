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
        done()

  afterEach ->
    benv.teardown()

  it 'adds artworks from urls'

  it 'removes an artwork on click', ->
    @component.state.artworks = [
      { id: '1', title: 'Baz'}
      a = { id: '2', title: 'Foo' }
      { id: '3', title: 'Bar'}
    ]
    @component.removeArtwork(a)()
    @component.setState.args[0][0].artworks.length.should.equal 2
    @component.setState.args[0][0].artworks[1].title.should.equal 'Bar'

  xit 'renders the artworks', ->
    @component.state.artworks = [
      { id: '1', title: 'Foo to the bar' }
    ]
    $(@component.getDOMNode()).html().should.containEql 'Foo to the bar'
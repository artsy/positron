benv = require 'benv'
sinon = require 'sinon'
_ = require 'underscore'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate
{ div } = React.DOM
fixtures = require '../../../../../../test/helpers/fixtures'

describe 'ByTitle', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: require 'jquery'
      ByTitle = benv.require  resolve(__dirname, '../by_title')
      @component = React.render ByTitle(
        artworks: new Backbone.Collection [fixtures().artworks]
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        sinon.stub Backbone, 'sync'
        done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown()

  it 'searches artworks by title', ->
    @component.search 'Skull'
    Backbone.sync.args[0][2].data.q.should.equal 'Skull'
    Backbone.sync.args[0][2].success results: artworks = [fixtures().artworks]
    @component.setState.args[1][0].artworks[0].artwork.title.should
      .equal artworks[0].artwork.title

  it 'sets the highlighted item on keyup', ->
    @component.state.highlighted = 2
    @component.onKeyUp which: 38
    @component.setState.args[0][0].highlighted.should.equal 1

  it 'adds the highlighted work', ->
    @component.state.artworks = [fixtures().artworks,
      _.extend fixtures().artworks, foo: 'bar'
    ]
    @component.state.highlighted = 1
    @component.addHighlighted()
    @component.props.artworks.last().get('foo').should.equal 'bar'
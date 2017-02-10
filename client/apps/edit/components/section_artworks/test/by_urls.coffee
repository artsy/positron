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

describe 'ByUrls', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      ByUrls = benv.require  resolve(__dirname, '../by_urls')
      @component = React.render ByUrls(
        artworks: new Backbone.Collection [fixtures().artworks]
        fetchArtworks: sinon.stub()
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        sinon.stub Backbone, 'sync'
        done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown()

  it 'adds artworks from urls', ->
    $(@component.refs.textarea.getDOMNode()).val 'artsy.net/foo\nartsy.net/baz'
    @component.props.artworks = []
    @component.addArtworksFromUrls (preventDefault: ->)
    @component.props.fetchArtworks.args[0][0].join('').should.equal 'foobaz'
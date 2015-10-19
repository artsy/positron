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

describe 'SectionSlideshow', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      @SectionSlideshow = benv.require resolve __dirname, '../index'
      sinon.stub Backbone, 'sync'
      @component = React.render @SectionSlideshow(
        section: new Section { type: 'slideshow', items: [
          { type: 'artwork', id: 'foo' }
          { type: 'artwork', id: 'bar' }
        ] }
        editing: false
        setEditing: ->
        changeLayout: ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown()

  it 'fetches the artworks on mount', ->
    @component.componentDidMount()
    Backbone.sync.args[0][1].url().should.containEql 'foo'
    Backbone.sync.args[1][1].url().should.containEql 'bar'

  it 'renders the images', ->
    React.renderToString(@SectionSlideshow(
      section: new Section { type: 'slideshow', items: [
        { type: 'image', url: 'http://foobar.jpg' }
      ] }
      editing: false
      setEditing: ->
      changeLayout: ->
    )).should.containEql 'http://foobar.jpg'
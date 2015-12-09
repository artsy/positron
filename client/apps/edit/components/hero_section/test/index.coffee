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

describe 'HeroSection', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      HeroSection = benv.require resolve __dirname, '../index'
      @SectionContainer = React.createClass
        render: ->
          div 'Hello World'
      HeroSection.__set__ 'SectionContainer', @SectionContainer
      @component = React.render HeroSection(
        section: @section = new Backbone.Model
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        editing: false
        setEditing: -> ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'opens a video section and sets the model type', ->
    @component.setHero('video')({})
    @component.setState.args[0][0].editing.should.equal true
    @section.get('type').should.equal 'video'

  it 'opens an image section and sets the model type', ->
    @component.setHero('image')({})
    @component.setState.args[0][0].editing.should.equal true
    @section.get('type').should.equal 'image'

  it 'opens a fullscreen section and sets the model type', ->
    @component.setHero('fullscreen')({})
    @component.setState.args[0][0].editing.should.equal true
    @section.get('type').should.equal 'fullscreen'

  it 'renders on change', ->
    @component.forceUpdate = sinon.stub()
    @section.trigger 'change'
    @component.forceUpdate.called.should.be.ok

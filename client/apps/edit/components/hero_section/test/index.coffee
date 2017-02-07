benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
HeroSection = require '../index'

r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate
{ div } = React.DOM
fixtures = require '../../../../../../test/helpers/fixtures'

describe 'HeroSection', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      $.imagesLoaded = sinon.stub()
      HeroSection = benv.require resolve __dirname, '../index'
      @SectionContainer = React.createClass
        render: ->
          div 'Hello World'
      HeroSection.__set__ 'SectionContainer', @SectionContainer
      HeroSection.__set__ 'imagesLoaded', sinon.stub()
      props = {
        section: @section = new Backbone.Model
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        editing: false
        setEditing: -> ->
      }
      @component = ReactDOM.render React.createElement(HeroSection, props), (@$el = $ "<div></div>")[0], => setTimeout =>
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

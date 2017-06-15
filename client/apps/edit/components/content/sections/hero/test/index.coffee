benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'

describe 'HeroSection', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      $.imagesLoaded = sinon.stub()
      HeroSection = benv.require resolve __dirname, '../index'
      SectionContainer = benv.requireWithJadeify(
        resolve(__dirname, '../../../section_container/index'), ['icons']
      )
      SectionTool = benv.requireWithJadeify(
        resolve(__dirname, '../../../section_tool/index'), ['icons']
      )
      HeroSection.__set__ 'SectionContainer', React.createFactory SectionContainer
      HeroSection.__set__ 'SectionTool', React.createFactory SectionTool
      HeroSection.__set__ 'resize', sinon.stub()
      @component = ReactDOM.render React.createElement(HeroSection, {
        section: @section = new Backbone.Model
        editing: false
        setEditing: -> ->
      }), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          sinon.stub @component, 'forceUpdate'
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
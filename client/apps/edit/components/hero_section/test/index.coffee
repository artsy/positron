benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'

fixtures = require '../../../../../../test/helpers/fixtures'

describe 'HeroSection', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      $.imagesLoaded = sinon.stub()
      HeroSection = benv.require resolve __dirname, '../index'
      SectionContainer = benv.requireWithJadeify( resolve(__dirname, '../../section_container/index'), ['icons'])
      HeroSection.__set__ 'SectionContainer', React.createFactory(SectionContainer)

      @component = ReactDOM.render React.createElement(HeroSection, {
        section: @section = new Backbone.Model
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        editing: false
        setEditing: -> ->
      }), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          sinon.stub @component, 'setState'
          done()

  afterEach ->
    benv.teardown()

  xit 'opens a video section and sets the model type', ->
    @component.setHero('video')({})
    @component.setState.args[0][0].editing.should.equal true
    @section.get('type').should.equal 'video'

  xit 'opens an image section and sets the model type', ->
    @component.setHero('image')({})
    @component.setState.args[0][0].editing.should.equal true
    @section.get('type').should.equal 'image'

  xit 'opens a fullscreen section and sets the model type', ->
    @component.setHero('fullscreen')({})
    @component.setState.args[0][0].editing.should.equal true
    @section.get('type').should.equal 'fullscreen'

  xit 'renders on change', ->
    @component.forceUpdate = sinon.stub()
    @section.trigger 'change'
    @component.forceUpdate.called.should.be.ok

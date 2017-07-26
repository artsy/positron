benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate
  render: ReactTestUtils.renderIntoDocument

describe 'SectionControls', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      $.fn.offset = sinon.stub().returns(top: 200)
      $.fn.height = sinon.stub().returns(200)
      window.innerHeight = 900
      window.innerWidth = 1400
      @SectionControls = benv.require resolve(__dirname, '../index')
      @props = {
        section: new Backbone.Model
          type: 'image_collection'
          layout: 'overflow_fillwidth'
        editing: true
        channel: { isEditorial: sinon.stub().returns(true) }
        isHero: false
        article: new Backbone.Model
          layout: 'classic'
      }

      @component = ReactDOM.render React.createElement(@SectionControls, @props), (@$el = $ "<div></div>")[0], => setTimeout =>
      @component.isScrollingOver = sinon.stub().returns(true)
      @component.isScrolledPast = sinon.stub().returns(false)
      $(ReactDOM.findDOMNode(@component)).parent().prepend(
          "<section class='edit-section-container' data-editing='true' style='height:300px'>
          </section>"
      )
      done()

  afterEach ->
    benv.teardown()

  describe '#setInsideComponent', ->

    it 'returns true if item is scrolled over and not scrolled past', ->
      @component.setInsideComponent()
      @component.state.insideComponent.should.eql true

    it 'returns false if item is scrolled past', ->
      @component.isScrolledPast = sinon.stub().returns(true)
      @component.setInsideComponent()
      @component.state.insideComponent.should.eql false

    it 'returns true when hero section and not scrolled past', ->
      @props.isHero = true
      component = ReactDOM.render React.createElement(@SectionControls, @props), (@$el = $ "<div></div>")[0], =>
      component.setInsideComponent()
      component.state.insideComponent.should.eql true


  describe '#getControlsWidth', ->

    it 'returns 620 for column_width sections', ->
      @component.props.section.set 'layout', 'column_width'
      width = @component.getControlsWidth()
      width.should.eql 620

    it 'returns 900 if image_set or has overflow layout', ->
      width = @component.getControlsWidth()
      width.should.eql 940

      @component.props.section.set 'type', 'image_set'
      width = @component.getControlsWidth()
      width.should.eql 940

      @component.props.section.set 'type', 'video'
      width = @component.getControlsWidth()
      width.should.eql 940

    it 'returns 1100 if hero section', ->
      @props.isHero = true
      component = ReactDOM.render React.createElement(@SectionControls, @props), (@$el = $ "<div></div>")[0], =>
      width = component.getControlsWidth()
      width.should.eql 1100


  describe '#getHeaderSize', ->

    it 'returns 95 when channel is editorial', ->
      header = @component.getHeaderSize()
      header.should.eql 95

    it 'returns 55 when channel is not editorial', ->
      @props.channel = { isEditorial: sinon.stub().returns(false) }
      component = ReactDOM.render React.createElement(@SectionControls, @props), (@$el = $ "<div></div>")[0], =>
      header = component.getHeaderSize()
      header.should.eql 55


  describe '#getPositionBottom', ->

    it 'when inside component, calculates based on window scroll position', ->
      @component.props.section.set 'type', 'video'
      @component.setState insideComponent: true
      bottom = @component.getPositionBottom()
      bottom.should.eql 605

    it 'when inside component, adds a 20px buffer for images', ->
      @component.setState insideComponent: true
      bottom = @component.getPositionBottom()
      bottom.should.eql 585

    it 'when outside component, returns 100%', ->
      @component.props.section.set 'type', 'video'
      @component.setState insideComponent: false
      bottom = @component.getPositionBottom()
      bottom.should.eql '100%'

    it 'when outside component, adds a 20px buffer for images', ->
      @component.setState insideComponent: false
      bottom = @component.getPositionBottom()
      bottom.should.eql 'calc(100% + 20px)'


  describe '#getPositionLeft', ->

    it 'calculates width based on window when insideComponent', ->
      left = @component.getPositionLeft()
      left.should.eql 285

    it 'returns 0 if outside component', ->
      @component.props.section.set 'type', 'video'
      @component.setState insideComponent: false
      left = @component.getPositionLeft()
      left.should.eql 0


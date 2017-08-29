benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
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
        channel:
          isEditorial: sinon.stub().returns(true)
          hasFeature: sinon.stub().returns(true)
        isHero: false
        sectionLayouts: true
        articleLayout: 'classic'
      }

      @component = ReactDOM.render React.createElement(
        @SectionControls
        @props
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
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
      component = ReactDOM.render React.createElement(
        @SectionControls
        @props
      ), (@$el = $ "<div></div>")[0], =>
      component.setInsideComponent()
      component.state.insideComponent.should.eql true


  describe '#getControlsWidth', ->

    it 'returns 620 for column_width sections', ->
      @component.props.section.set 'layout', 'column_width'
      width = @component.getControlsWidth()
      width.should.eql 620

    it 'returns 900 if image_set or has overflow layout', ->
      width = @component.getControlsWidth()
      width.should.eql 900

      @component.props.section.set 'type', 'image_set'
      width = @component.getControlsWidth()
      width.should.eql 900

      @component.props.section.set 'type', 'video'
      width = @component.getControlsWidth()
      width.should.eql 900

    it 'returns 1100 if hero section', ->
      @props.isHero = true
      component = ReactDOM.render React.createElement(
        @SectionControls
        @props
      ), (@$el = $ "<div></div>")[0], =>
      width = component.getControlsWidth()
      width.should.eql 1100


  describe '#getHeaderSize', ->

    it 'returns 95 when channel is editorial', ->
      header = @component.getHeaderSize()
      header.should.eql 95

    it 'returns 55 when channel is not editorial', ->
      @props.channel = {
        isEditorial: sinon.stub().returns(false)
        hasFeature: sinon.stub().returns(false)
      }
      component = ReactDOM.render React.createElement(
        @SectionControls
        @props
      ), (@$el = $ "<div></div>")[0], =>
      header = component.getHeaderSize()
      header.should.eql 55


  describe '#getPositionBottom', ->

    it 'when inside component, calculates based on window scroll position', ->
      @component.setState insideComponent: true
      bottom = @component.getPositionBottom()
      bottom.should.eql 605

    it 'when outside component, returns 100%', ->
      @component.setState insideComponent: false
      bottom = @component.getPositionBottom()
      bottom.should.eql '100%'


  describe '#getPositionLeft', ->

    it 'calculates width based on window when insideComponent', ->
      left = @component.getPositionLeft()
      left.should.eql 305

    it 'returns 0 if outside component and standard/feature layout', ->
      @props.articleLayout = 'standard'
      component = ReactDOM.render React.createElement(
        @SectionControls
        @props
      ), (@$el = $ "<div></div>")[0], =>
      component.setState insideComponent: false
      left = component.getPositionLeft()
      left.should.eql 0

    it 'returns 20px if outside component and classic layout', ->
      @component.setState insideComponent: false
      left = @component.getPositionLeft()
      left.should.eql '20px'


  describe 'Section Layouts', ->

    it 'renders the layout icons if props.sectionLayouts is true', ->
      $(ReactDOM.findDOMNode(@component)).html().should.containEql(
        '<nav class="edit-controls__layout">'
      )

    it 'doesn not render the layout icons if props.sectionLayouts is false', ->
      @props.sectionLayouts = false
      component = ReactDOM.render React.createElement(
        @SectionControls
        @props
      ), (@$el = $ "<div></div>")[0], =>
      $(ReactDOM.findDOMNode(component)).html().should.not.containEql(
        '<nav class="edit-controls__layout">'
      )

    it 'shows the image_set icon if section is image_set', ->
      @component.props.section.set 'type', 'image_set'
      @component.forceUpdate()
      $(ReactDOM.findDOMNode(@component)).html().should.containEql(
        '<a name="image_set" class="layout" data-active="true">'
      )

    it 'shows the image_set icon if section is image_collection', ->
      $(ReactDOM.findDOMNode(@component)).html().should.containEql(
        '<a name="image_set" class="layout" data-active="false">'
      )

    it 'shows the fullscreen icon if articleLayout is feature', ->
      @props.articleLayout = 'feature'
      component = ReactDOM.render React.createElement(
        @SectionControls
        @props
      ), (@$el = $ "<div></div>")[0], =>
      $(ReactDOM.findDOMNode(component)).html().should.containEql(
        '<a name="fillwidth" class="layout"'
      )

    it 'does not display image_set option unless channel has feature', ->
      @component.props.channel.hasFeature = sinon.stub().returns(false)
      @component.forceUpdate()
      r.find(@component, 'layout').length.should.eql 2
      $(ReactDOM.findDOMNode(@component)).html().should.not.containEql 'image_set'


    describe '#changeLayout', ->

      it 'changes the layout on click', ->
        r.simulate.click r.find(@component, 'layout')[1]
        @props.section.get('layout').should.eql 'column_width'

      it 'toggles an image_set back to image_collection on click', ->
        @component.props.section.set({
          type: 'image_set'
          layout: 'null'
        })
        @component.forceUpdate()
        r.simulate.click r.find(@component, 'layout')[0]
        @props.section.get('layout').should.eql 'overflow_fillwidth'
        @props.section.get('type').should.eql 'image_collection'
        $(ReactDOM.findDOMNode(@component)).html().should.containEql(
          '<a name="overflow_fillwidth" class="layout" data-active="true">'
        )


    describe '#toggleImageSet', ->

      it 'converts an image_collection to an image_set', ->
        r.simulate.click r.find(@component, 'layout')[2]
        $(ReactDOM.findDOMNode(@component)).html().should.containEql(
          '<a name="image_set" class="layout" data-active="true">'
        )
        @props.section.get('type').should.eql 'image_set'

      it 'does nothing if already an image_set', ->
        @component.props.section.set({
          type: 'image_set'
          layout: 'null'
        })
        @component.forceUpdate()
        r.simulate.click r.find(@component, 'layout')[2]
        $(ReactDOM.findDOMNode(@component)).html().should.containEql(
          '<a name="image_set" class="layout" data-active="true">'
        )
        @props.section.get('type').should.eql 'image_set'

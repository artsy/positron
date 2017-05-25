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

describe 'SectionContainer', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      $.fn.position = sinon.stub().returns(top: 800)
      @SectionContainer = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      @props = {
        section: new Backbone.Model(
          { body: 'Foo to the bar', type: 'text', layout: 'foo' }
        )
        onSetEditing: @onSetEditing = sinon.stub()
        index: 4
        onDragStart: @onDragStart = sinon.stub()
        onDragEnd: @onDragEnd = sinon.stub()
        dragOver: 4
      }
      @SectionContainer.__set__ 'SectionText', ->
      @component = ReactDOM.render React.createElement(@SectionContainer, @props
      ), $("<div></div>")[0], => setTimeout =>
        @component.setState = sinon.stub()
        done()

  afterEach ->
    benv.teardown()

  it 'can delete a section', ->
    @component.props.section.destroy = sinon.stub()
    r.simulate.click r.find(@component, 'edit-section-remove')
    @component.props.section.destroy.called.should.be.ok

  it 'calls back to set the editing state upstream', ->
    @component.props.editing = false
    r.simulate.click r.find @component, 'edit-section-hover-controls'
    @onSetEditing.args[0][0].should.equal 4

  it 'exits editing mode when clicking off and callsback a parent', ->
    r.simulate.click r.find @component, 'edit-section-container-bg'
    (@component.props.onSetEditing.args[0][0]?).should.not.be.ok

  it 'is draggable by default', ->
    $(ReactDOM.findDOMNode(@component)).attr('draggable').should.eql 'true'

  it 'is not draggable if hero section', ->
    @props.isHero = true
    rendered = ReactDOMServer.renderToString React.createElement(@SectionContainer, @props)
    rendered.should.not.containEql 'draggable'
    rendered.should.not.containEql 'edit-section-drag'

  it 'hides container controls if fullscreen', ->
    @props.isHero = true
    @props.section.set 'type', 'fullscreen'
    @SectionContainer.__set__ 'SectionFullscreen', ->
    rendered = ReactDOMServer.renderToString React.createElement(@SectionContainer, @props)
    rendered.should.not.containEql 'edit-section-hover-controls'

  it 'triggers onDragStart and calls props.onDragStart when section is dragged', ->
    r.simulate.dragStart r.find @component, 'edit-section-container'
    @onDragStart.called.should.be.ok

  it 'calls props.onDragEnd when drag ends', ->
    r.simulate.dragEnd r.find @component, 'edit-section-container'
    @onDragEnd.called.should.be.ok

  it 'toggles data-dragging if section is being dragged', ->
    @props.dragging = 4
    rendered = ReactDOMServer.renderToString React.createElement(@SectionContainer, @props)
    rendered.should.containEql 'data-dragging="true"'

  it 'prints a drop zone if an item is dragged over', ->
    @props.dragging = 3
    @props.draggingHeight = 300
    rendered = ReactDOMServer.renderToString React.createElement(@SectionContainer, @props)
    rendered.should.containEql 'edit-section-drag-placeholder" style="height:300px;"'

  it 'does not print a drop zone if dragging over original position', ->
    @props.dragging = 4
    rendered = ReactDOMServer.renderToString React.createElement(@SectionContainer, @props)
    rendered.should.not.containEql 'edit-section-drag-placeholder'



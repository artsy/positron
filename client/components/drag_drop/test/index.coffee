benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactDOMServer = require 'react-dom/server'
ReactTestUtils = require 'react-addons-test-utils'
r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  simulate: ReactTestUtils.Simulate

describe 'DragDropContainer', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
      @DragDropContainer = benv.require resolve(__dirname, '../index.coffee')
      DragTarget = benv.require resolve __dirname, '../drag_target.coffee'
      DragSource = benv.require resolve __dirname, '../drag_source.coffee'
      ImageDisplay = benv.requireWithJadeify(
        resolve __dirname, '../../../apps/edit/components/section_image_collection/components/image.coffee'
        ['icons']
      )
      @DragDropContainer.__set__ 'DragTarget', React.createFactory DragTarget
      @DragDropContainer.__set__ 'DragSource', React.createFactory DragSource
      @props = {
        isDraggable: true
        onDragEnd: @onDragEnd = sinon.stub()
        items: [ {image: {url: 'image1.com'}}, {image: {url: 'image2.com'}} ]
      }
      @children = [
        React.createElement(ImageDisplay, {key:'child-1', i: 0, image: {url: 'image1.com'}, removeItem: sinon.stub()})
        React.createElement(ImageDisplay, {key:'child-2', i: 1, image: {url: 'image2.com'}, removeItem: sinon.stub()})
      ]
      @component = ReactDOM.render React.createElement(@DragDropContainer, @props, @children), (@$el = $ "<div></div>")[0], =>
      done()

  afterEach ->
    benv.teardown()


  it 'renders a drag container with children', ->
    @$el.find('.drag-target').length.should.eql 2
    @$el.find('.drag-source').length.should.eql 2
    @$el.find('img').length.should.eql 2

  it 'sets draggable to true if props.isDraggable', ->
    @$el.find('.drag-source[draggable=true]').length.should.eql 2

  it 'sets draggable to false if not props.isDraggable', ->
    @props.isDraggable = false
    rendered = ReactDOMServer.renderToString React.createElement(@DragDropContainer, @props, @children)
    $(rendered).find('.drag-source[draggable=false]').length.should.eql 2
    $(rendered).find('.drag-source[draggable=true]').length.should.eql 0

  it 'sets state.dragSource on DragStart', ->
    @component.setState = sinon.stub()
    r.simulate.dragStart r.find(@component, 'drag-source')[1]
    @component.setState.args[0][0].dragSource.should.eql 1

  it 'sets state.dragTarget on DragEnd', ->
    @component.setState = sinon.stub()
    r.simulate.dragOver r.find(@component, 'drag-target')[0]
    @component.setState.args[0][0].dragTarget.should.eql 0


  describe '#DragEnd', ->

    it 'does not call onDragEnd if target is same as source', ->
      r.simulate.dragStart r.find(@component, 'drag-source')[0]
      r.simulate.dragOver r.find(@component, 'drag-target')[0]
      @onDragEnd.called.should.not.be.ok

    it 'Returns an array of new items to the parent component on DragEnd', ->
      r.simulate.dragStart r.find(@component, 'drag-source')[1]
      r.simulate.dragOver r.find(@component, 'drag-target')[0]
      r.simulate.dragEnd r.find(@component, 'drag-source')[1]
      @onDragEnd.args[0][0][0].image.url.should.eql 'image2.com'
      @onDragEnd.args[0][0][1].image.url.should.eql 'image1.com'

    it 'Resets the state dragSource and dragTarget to null', ->
      r.simulate.dragStart r.find(@component, 'drag-source')[1]
      r.simulate.dragOver r.find(@component, 'drag-target')[0]
      r.simulate.dragEnd r.find(@component, 'drag-source')[1]
      @component.state.should.eql { dragSource: null, dragTarget: null }

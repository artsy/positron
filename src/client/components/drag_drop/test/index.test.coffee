benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
Backbone = require 'backbone'
React = require 'react'
ReactDOM = require 'react-dom'
ReactDOMServer = require 'react-dom/server'
ReactTestUtils = require 'react-dom/test-utils'
Sections = require '../../../collections/sections.coffee'
Section = require '../../../models/section.coffee'
{ StandardArticle } = require('@artsy/reaction/dist/Components/Publishing/Fixtures/Articles')

r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  simulate: ReactTestUtils.Simulate

describe 'DragDropContainer Default', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
      global.HTMLElement = () -> {}
      global.Image = () => {}
      window.matchMedia = sinon.stub().returns(
        {
          matches: false
          addListener: sinon.stub()
          removeListener: sinon.stub()
        }
      )
      @DragDropContainer = benv.require resolve(__dirname, '../index.coffee')
      DragTarget = benv.require resolve __dirname, '../drag_target.coffee'
      DragSource = benv.require(resolve(__dirname, '../drag_source.jsx')).DragSource
      @DragDropContainer.__set__ 'DragTarget', React.createFactory DragTarget
      @DragDropContainer.__set__ 'DragSource', DragSource
      @props = {
        isDraggable: true
        onDragEnd: @onDragEnd = sinon.stub()
        items: StandardArticle.sections[4].images
      }

      { EditImage } = benv.require(
        resolve __dirname, '../../../apps/edit/components/content/sections/images/components/edit_image.jsx'
      )
      @children = [
        React.createElement(
          EditImage,
          {
            key:'child-1',
            index: 0,
            article: {layout: 'classic'},
            section: StandardArticle.sections[4],
            width: null,
            image: StandardArticle.sections[4].images[0],
            removeItem: sinon.stub(),
            onChange: sinon.stub()
          }
        )
        React.createElement(
          EditImage,
          {
            key:'child-2',
            index: 1,
            article: {layout: 'classic'},
            section: StandardArticle.sections[4],
            width: null,
            image: StandardArticle.sections[4].images[1],
            removeItem: sinon.stub(),
            onChange: sinon.stub()
          }
        )
      ]
      @component = ReactDOM.render React.createElement(@DragDropContainer, @props, @children), (@$el = $ "<div></div>")[0], ->
      done()

  afterEach (done) ->
    benv.teardown()
    done()

  it 'renders a drag container with children', ->
    @$el.find('.drag-target').length.should.eql 2
    @$el.find('.DragSource').length.should.eql 2
    @$el.find('img').length.should.eql 2

  it 'sets draggable to true if props.isDraggable', ->
    @$el.find('.DragSource[draggable=true]').length.should.eql 2

  it 'sets draggable to false if not props.isDraggable', ->
    @props.isDraggable = false
    rendered = ReactDOMServer.renderToString React.createElement(@DragDropContainer, @props, @children)
    $(rendered).find('.DragSource').length.should.eql 0
    $(rendered).find('[draggable=true]').length.should.eql 0

  it 'sets state.dragSource on DragStart', ->
    @component.setState = sinon.stub()
    r.simulate.dragStart r.find(@component, 'DragSource')[1]
    @component.setState.args[0][0].dragSource.should.eql 1

  xit 'sets state.dragTarget on DragEnd', (done) ->
    @component.setState dragSource: 1
    @component.setState = sinon.stub()
    r.simulate.dragOver r.find(@component, 'drag-target')[0]
    setTimeout( =>
      @component.setState.args[0][0].dragTarget.should.eql 0
      done()
    , 3)

  it 'setDropZonePosition returns top if props.layout is not vertical', ->
    $dragTarget = sinon.stub()
    $dragTarget.position = sinon.stub().returns(top: 200)
    $dragTarget.height = sinon.stub().returns(250)
    position = @component.setDropZonePosition($dragTarget, 1, 200)
    position.should.eql 'top'

  describe '#DragEnd', ->

    it 'does not call onDragEnd if target is same as source', ->
      r.simulate.dragStart r.find(@component, 'DragSource')[0]
      r.simulate.dragOver r.find(@component, 'drag-target')[0]
      @onDragEnd.called.should.not.be.ok

    it 'Returns an array of new items to the parent component on DragEnd', ->
      r.simulate.dragStart r.find(@component, 'DragSource')[1]
      r.simulate.dragOver r.find(@component, 'drag-target')[0]
      r.simulate.dragEnd r.find(@component, 'DragSource')[1]
      @onDragEnd.args[0][0][0].url.should.eql StandardArticle.sections[4].images[1].url
      @onDragEnd.args[0][0][1].url.should.eql StandardArticle.sections[4].images[0].url

    it 'Resets the state on DragEnd', ->
      r.simulate.dragStart r.find(@component, 'DragSource')[1]
      r.simulate.dragOver r.find(@component, 'drag-target')[0]
      r.simulate.dragEnd r.find(@component, 'DragSource')[1]
      @component.state.should.eql {
        dragSource: null
        dragStartY: null
        dragTarget: null
        draggingHeight: 0
        dropPosition: 'top'
      }


describe 'DragDropContainer Vertical', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
      global.HTMLElement = () -> {}
      global.Image = () => {}
      window.matchMedia = sinon.stub().returns(
        {
          matches: false
          addListener: sinon.stub()
          removeListener: sinon.stub()
        }
      )
      @DragDropContainer = benv.require resolve(__dirname, '../index.coffee')
      DragTarget = benv.require resolve __dirname, '../drag_target.coffee'
      DragSource = benv.require(resolve(__dirname, '../drag_source.jsx')).DragSource
      @DragDropContainer.__set__ 'DragTarget', React.createFactory DragTarget
      @DragDropContainer.__set__ 'DragSource', DragSource
      @props = {
        isDraggable: true
        onDragEnd: @onDragEnd = sinon.stub()
        items: StandardArticle.sections[4].images
        layout: 'vertical'
      }

      { EditImage } = benv.require(
        resolve __dirname, '../../../apps/edit/components/content/sections/images/components/edit_image.jsx'
      )
      @children = [
        React.createElement(
          EditImage,
          {
            key:'child-1',
            index: 0,
            article: {layout: 'classic'},
            section: StandardArticle.sections[4],
            width: null,
            image: StandardArticle.sections[4].images[0],
            removeItem: sinon.stub(),
            onChange: sinon.stub()
          }
        )
        React.createElement(
          EditImage,
          {
            key:'child-2',
            index: 1,
            article: {layout: 'classic'},
            section: StandardArticle.sections[4],
            width: null,
            image: StandardArticle.sections[4].images[1],
            removeItem: sinon.stub(),
            onChange: sinon.stub()
          }
        )
      ]
      @component = ReactDOM.render React.createElement(@DragDropContainer, @props, @children), (@$el = $ "<div></div>")[0], ->
      done()

  afterEach (done) ->
    benv.teardown()
    done()
 
  it 'renders a drag container with children', ->
    @$el.find('.drag-target').length.should.eql 2
    @$el.find('.DragSource').length.should.eql 2
    @$el.find('img').length.should.eql 2

  it 'adds a vertical class to active drag-targets', ->
    @component.setState
      dragSource: 1
      dragTarget: 0
    $(ReactDOM.findDOMNode(@component)).find('.drag-target').html().should.containEql 'drag-placeholder vertical'


  describe '#setDropZonePosition', ->

    it 'returns bottom if dragTargetIsNext', ->
      $dragTarget = sinon.stub()
      $dragTarget.position = sinon.stub().returns(top: 200)
      $dragTarget.height = sinon.stub().returns(250)
      position = @component.setDropZonePosition($dragTarget, 1, 200)
      position.should.eql 'bottom'

    it 'returns top if dragTarget is first section', ->
      $dragTarget = sinon.stub()
      $dragTarget.position = sinon.stub().returns(top: 200)
      $dragTarget.height = sinon.stub().returns(250)
      position = @component.setDropZonePosition($dragTarget, 0, 200)
      position.should.eql 'top'

    it 'returns top if mouse is above center', ->
      $dragTarget = sinon.stub()
      $dragTarget.position = sinon.stub().returns(top: 200)
      $dragTarget.height = sinon.stub().returns(250)
      position = @component.setDropZonePosition($dragTarget, 2, 200)
      position.should.eql 'top'

    it 'returns bottom if mouse is below center', ->
      $dragTarget = sinon.stub()
      $dragTarget.position = sinon.stub().returns(top: 200)
      $dragTarget.height = sinon.stub().returns(250)
      position = @component.setDropZonePosition($dragTarget, 2, 350)
      position.should.eql 'bottom'

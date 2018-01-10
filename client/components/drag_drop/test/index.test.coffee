benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
Backbone = require 'backbone'
React = require 'react'
ReactDOM = require 'react-dom'
ReactDOMServer = require 'react-dom/server'
ReactTestUtils = require 'react-addons-test-utils'
Sections = require '../../../collections/sections.coffee'
Section = require '../../../models/section.coffee'
Article = require '../../../models/article.coffee'
{ Fixtures } = require('@artsy/reaction-force/dist/Components/Publishing')
StandardArticle = Fixtures.StandardArticle
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
      article = new Article layout: 'standard'
      section = new Section StandardArticle.sections[4]
      ImageDisplay = benv.require(
        resolve __dirname, '../../../apps/edit/components/content/sections/image_collection/components/image.jsx'
      )
      @children = [
        React.createElement(
          ImageDisplay.default,
          {
            key:'child-1',
            i: 0,
            article: article,
            section: section,
            width: null,
            image: StandardArticle.sections[4].images[0],
            removeItem: sinon.stub(),
            onChange: sinon.stub()
          }
        )
        React.createElement(
          ImageDisplay.default,
          {
            key:'child-2',
            i: 1,
            article: article,
            section: section,
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
      global.Image = () => {}
      @DragDropContainer = benv.require resolve(__dirname, '../index.coffee')
      DragTarget = benv.require resolve __dirname, '../drag_target.coffee'
      DragSource = benv.require(resolve(__dirname, '../drag_source.jsx')).DragSource
      @DragDropContainer.__set__ 'DragTarget', React.createFactory DragTarget
      @DragDropContainer.__set__ 'DragSource', DragSource
      SectionTool = benv.require(
        resolve __dirname, '../../../apps/edit/components/content/section_tool/index.jsx'
      )
      SectionContainer = benv.require(
        resolve __dirname, '../../../apps/edit/components/content/section_container/index.js'
      )
      ImageCollection = benv.require(
        resolve __dirname, '../../../apps/edit/components/content/sections/image_collection/index.coffee'
      )
      ImageCollection.__set__ 'Controls', sinon.stub()
      ImageCollection.__set__ 'imagesLoaded', sinon.stub().returns(true)
      SectionContainer.__set__ 'ImageCollection', React.createFactory ImageCollection
      hasFeature = sinon.stub().returns(true)
      section2 = new Section StandardArticle.sections[16]
      section3 = new Section StandardArticle.sections[8]
      @props = {
        isDraggable: true
        onDragEnd: @onDragEnd = sinon.stub()
        items: @sections = new Sections([
            StandardArticle.sections[8]
            StandardArticle.sections[8]
            StandardArticle.sections[16]
          ])
        layout: 'vertical'
        article: @article = new Article layout: 'standard'
      }
      @children = [
        React.createElement(
          SectionContainer
          {
            key:'child-1'
            i: 0
            article: @article
            section: @sections.models[0]
            sections: @sections
            editing: false
            channel: {hasFeature: hasFeature}
          }
        )
        React.createElement(
          SectionTool.default
          {key:'child-2', i: 1, sections: @sections, channel: {hasFeature: hasFeature}, editing: false}
        )
        React.createElement(
          SectionContainer
          {
            key:'child-3'
            i: 2
            article: @article
            section: @sections.models[1]
            sections: @sections
            editing: false
            channel: {hasFeature: hasFeature}
          }
        )
        React.createElement(
          SectionContainer
          {
            key:'child-4'
            i: 3
            article: @article
            section: @sections.models[2]
            sections: @sections
            editing: false
            channel: {hasFeature: hasFeature}
          }
        )
      ]
      @component = ReactDOM.render(
        React.createElement(@DragDropContainer, @props, @children)
        (@$el = $ "<div></div>")[0], ->
      )
      done()

  afterEach ->
    benv.teardown()

  it 'renders a drag container with children', ->
    @$el.find('.drag-target').length.should.eql 4
    @$el.find('.DragSource').length.should.eql 4
    @$el.find('img').length.should.eql 3

  it 'does not add draggable properties to sectionTool', ->
    @$el.find('.edit-tool').parent().hasClass('.DragSource').should.not.be.ok
    @$el.find('.edit-tool').parent().hasClass('.drag-container').should.be.ok

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

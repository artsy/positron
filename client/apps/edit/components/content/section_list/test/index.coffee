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

describe 'SectionList', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      global.HTMLElement = () => {}
      @SectionList = benv.require resolve(__dirname, '../index')
      @SectionList.__set__ 'SectionTool', @SectionTool = sinon.stub()
      @SectionContainer = benv.requireWithJadeify(
        resolve(__dirname, '../../section_container/index'), ['icons']
      )
      @SectionContainer.__set__ 'SectionText', text = sinon.stub()
      @SectionContainer.__set__ 'SectionImageCollection', image_collection = sinon.stub()
      @SectionList.__set__ 'SectionContainer', React.createFactory @SectionContainer
      @props = {
        sections: @sections = new Backbone.Collection [
          { body: 'Foo to the bar', type: 'text' }
          { body: 'Foo to the bar', type: 'text' }
          { type: 'image', url: 'http://artsy.net/image.jpg', caption: '<p>An image caption</p>', layout: 'column_width'}
          {
            type: 'image_collection'
            images: [
              {
                type: 'image'
                url: 'https://artsy.net/image.png'
                caption: '<p>Here is a caption</p>'
              }
              {
                type: 'artwork'
                title: 'The Four Hedgehogs'
                id: '123'
                image: 'https://artsy.net/artwork.jpg'
                partner: name: 'Guggenheim'
                artists: [
                  {name: 'Van Gogh'}
                ]
              }
            ]
          }
        ]
      }
      @component = ReactDOM.render React.createElement(@SectionList, @props ), (@$el = $ "<div></div>")[0], => setTimeout =>
        @component.setState
          dragging: 0
          dragOver: 3
          dragStart: 400
          draggingHeight: 300
        @component.props.sections.off()
        done()

  afterEach ->
    benv.teardown()

  it 'renders the sections', ->
    @component.render()
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'An image caption'

  it 'sets an index for the section tools', ->
    @SectionTool.args[0][0].index.should.equal -1
    @SectionTool.args[1][0].index.should.equal 0
    @SectionTool.args[2][0].index.should.equal 1

  it 'opens editing mode in the last added section', ->
    @component.setState = sinon.stub()
    @component.onNewSection @component.props.sections.last()
    @component.setState.args[0][0].editingIndex.should.equal 3

  it 'toggles editing state when a child section callsback', ->
    @SectionList.__set__ 'SectionContainer', sectionContainer = sinon.stub()
    component = ReactDOM.render React.createElement(@SectionList, @props ), (@$el = $ "<div></div>")[0], =>
    sectionContainer.args[0][0].onSetEditing
      .should.equal component.onSetEditing

  it 'uses the section cid as a key b/c they have to be unique AND a \
      property specific to that piece of data, or model in our case', ->
    @SectionList.__set__ 'SectionContainer', sectionContainer = sinon.stub()
    component = ReactDOM.render React.createElement(@SectionList, @props ), (@$el = $ "<div></div>")[0], =>
    component.render()
    sectionContainer.args[0][0].key.should.equal @sections.at(0).cid
    sectionContainer.args[1][0].key.should.equal @sections.at(1).cid

  it 'onDragEnd resets the section order', ->
    @component.props.sections.models[3].get('type').should.eql 'image_collection'
    @component.onDragEnd()
    @component.props.sections.models[3].get('type').should.eql 'text'
    (@component.state.dragging?).should.not.be.ok
    (@component.state.dragOver?).should.not.be.ok
    (@component.state.dragStart?).should.not.be.ok
    @component.state.draggingHeight.should.eql 0

  it 'onRemoveSection resets the article sections if empty', ->
    @props.sections = new Backbone.Collection [{ body: 'Foo to the bar', type: 'text' }]
    @props.article = new Backbone.Model {sections: [{ body: 'Foo to the bar', type: 'text' }]}
    component = ReactDOM.render React.createElement(@SectionList, @props ), (@$el = $ "<div></div>")[0], =>
    component.render()
    r.simulate.click r.find(component, 'edit-section-remove')
    @props.article.get('sections').length.should.eql 0

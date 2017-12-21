benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-dom/test-utils'
ReactDOMServer = require 'react-dom/server'
Article = require '../../../../../../models/article.coffee'
Section = require '../../../../../../models/section.coffee'
Sections = require '../../../../../../collections/sections.coffee'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate
  render: ReactTestUtils.renderIntoDocument

describe 'SectionContainer', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      $.fn.position = sinon.stub().returns(top: 800)
      $.fn.height = sinon.stub().returns(300)
      window.jQuery = $
      window.matchMedia = sinon.stub().returns(
        {
          matches: false
          addListener: sinon.stub()
          removeListener: sinon.stub()
        }
      )
      @SectionContainer = benv.require resolve(__dirname, '../index')
      section1 = new Section { body: 'Foo to the bar', type: 'text' }
      section2 = new Section { body: 'Bar to the foo', type: 'text' }
      section3 = new Section { type: 'image_collection' }
      @props = {
        section: section1
        sections: new Sections [section1, section2, section3]
        onSetEditing: @onSetEditing = sinon.stub()
        index: 1
        onDragStart: @onDragStart = sinon.stub()
        onDragEnd: @onDragEnd = sinon.stub()
        dragOver: 4
        article: new Article
      }
      @SectionContainer.__set__ 'Text', ->
      @component = ReactDOM.render React.createElement(
        @SectionContainer, @props
      ), $("<div></div>")[0], => setTimeout =>
        @component.setState = sinon.stub()
        done()

  afterEach ->
    benv.teardown()

  it 'can delete a section', ->
    @component.props.section.destroy = sinon.stub()
    r.simulate.click r.find(@component, 'edit-section__remove')
    @component.props.section.destroy.called.should.be.ok

  it 'calls back to set the editing state upstream', ->
    @component.props.editing = false
    r.simulate.click r.find @component, 'edit-section__hover-controls'
    @onSetEditing.args[0][0].should.equal 1

  it 'exits editing mode when clicking off and callsback a parent', ->
    r.simulate.click r.find @component, 'edit-section__container-bg'
    (@component.props.onSetEditing.args[0][0]?).should.not.be.ok

  it '#getContentStartEnd returns the index of first and last text-sections', ->
    startEnd = @component.getContentStartEnd()
    startEnd.start.should.eql 0
    startEnd.end.should.eql 1

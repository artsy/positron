benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
Section = require '../../../../../../models/section.coffee'
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
      @SectionContainer = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      @props = {
        section: new Section(
          { body: 'Foo to the bar', type: 'text', layout: 'foo' }
        )
        sections: {length: 4}
        onSetEditing: @onSetEditing = sinon.stub()
        index: 1
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
    r.simulate.click r.find(@component, 'edit-section__remove')
    @component.props.section.destroy.called.should.be.ok

  it 'calls back to set the editing state upstream', ->
    @component.props.editing = false
    r.simulate.click r.find @component, 'edit-section__hover-controls'
    @onSetEditing.args[0][0].should.equal 1

  it 'exits editing mode when clicking off and callsback a parent', ->
    r.simulate.click r.find @component, 'edit-section__container-bg'
    (@component.props.onSetEditing.args[0][0]?).should.not.be.ok

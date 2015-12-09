benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate

describe 'SectionContainer', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      SectionContainer = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      SectionContainer.__set__ 'SectionText', ->
      @component = React.render SectionContainer(
        section: new Backbone.Model(
          { body: 'Foo to the bar', type: 'text', layout: 'foo' }
        )
        onSetEditing: @onSetEditing = sinon.stub()
        index: 4
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
    @component.setProps editing: false
    r.simulate.click r.find @component, 'edit-section-hover-controls'
    @onSetEditing.args[0][0].should.equal 4

  it 'exits editing mode when clicking off and callsback a parent', ->
    r.simulate.click r.find @component, 'edit-section-container-bg'
    (@component.props.onSetEditing.args[0][0]?).should.not.be.ok
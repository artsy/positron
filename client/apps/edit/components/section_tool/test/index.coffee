benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate

describe 'SectionTool', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: require 'jquery'
      SectionTool = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      @component = React.render SectionTool(
        sections: @sections = new Backbone.Collection [
          { body: 'Foo to the bar', type: 'text' }
          { body: 'Foo to the bar', type: 'text' }
        ]
        index: 2
        toggleEditMode: @toggleEditMode = sinon.stub()
      ), $("<div></div>")[0], -> setTimeout -> done()

  afterEach ->
    benv.teardown()

  it 'opens on click', ->
    r.simulate.click r.find @component, 'edit-section-tool-icon'
    @component.state.open.should.equal true

  it 'adds a new text section when clicking on it', ->
    r.simulate.click r.find @component, 'edit-section-tool-text'
    @component.props.sections.last().get('type').should.equal 'text'
    @component.props.sections.last().get('body').should.equal ''
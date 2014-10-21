benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate

describe 'SectionHoverControls', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: require 'jquery'
      SectionHoverControls = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      SectionHoverControls.__set__ 'SectionText', ->
      @component = React.renderComponent SectionHoverControls(
        section: new Backbone.Model { body: 'Foo to the bar' }
        toggleEditMode: @toggleEditMode = sinon.stub()
      ), $("<div></div>")[0], -> setTimeout -> done()

  afterEach ->
    benv.teardown()

  it 'can delete a section', ->
    @component.props.section.destroy = sinon.stub()
    r.simulate.click r.find(@component, 'edit-section-remove')
    @component.props.section.destroy.called.should.be.ok

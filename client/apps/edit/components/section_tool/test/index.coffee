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
      benv.expose $: benv.require 'jquery'
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

describe 'SectionTool - Hero', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
      SectionTool = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      SectionTool.__set__ 'sd', { USER: type: 'Admin' }
      @component = React.render SectionTool(
        sections: new Backbone.Collection [
          { type: 'fullscreen' }
        ]
        hero: true
        hasSection: false
        setHero: ->
        index: 2
        toggleEditMode: @toggleEditMode = sinon.stub()
      ), $("<div></div>")[0], -> setTimeout -> done()

  afterEach ->
    benv.teardown()

  it 'adds a new fullscreen section when clicking on it', ->
    r.simulate.click r.find @component, 'edit-section-tool-hero-fullscreen'
    @component.props.sections.first().get('type').should.equal 'fullscreen'

  it 'adds a new fullscreen section when clicking on it', ->
    @component.props.hasSection = true
    (r.find @component, 'edit-section-tool-hero-fullscreen').props.onClick?.should.be.false
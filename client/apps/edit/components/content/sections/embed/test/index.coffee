benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
Section = require '../../../../../../../models/section.coffee'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate
{ div } = React.DOM

describe 'SectionEmbed', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      SectionEmbed = benv.require resolve __dirname, '../index'
      @component = ReactDOM.render React.createElement(SectionEmbed,
        section: new Section { body: 'Foo to the bar', ids: [] }
        editing: false
        setEditing: ->
        changeLayout: ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        sinon.stub @component, 'forceUpdate'
        sinon.stub Backbone, 'sync'
        done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown()

  it 'destroys the section when clicking off', ->
    @component.props.section.on 'destroy', spy = sinon.spy()
    @component.onClickOff()
    spy.called.should.be.ok

  it 'gets width for overflow styling', ->
    @component.props.section.set layout: 'overflow'
    @component.getWidth().should.equal 1060

  it 'gets width for column_width styling', ->
    @component.props.section.set layout: 'column_width'
    @component.getWidth().should.equal 500

  it 'changes layout when clicking on layout controls', ->
    r.simulate.click r.find @component, 'ese-overflow'
    @component.props.section.get('layout').should.equal 'overflow'

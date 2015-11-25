benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
Section = require '../../../../../models/section.coffee'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate
{ div } = React.DOM

describe 'SectionEmbed', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      SectionEmbed = benv.requireWithJadeify(
        resolve(__dirname, '../index')
        ['icons']
      )
      @component = React.render SectionEmbed(
        section: new Section { body: 'Foo to the bar', ids: [] }
        editing: false
        setEditing: ->
        changeLayout: ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub $, 'get'
        sinon.stub @component, 'setState'
        sinon.stub @component, 'forceUpdate'
        sinon.stub Backbone, 'sync'
        done()

  afterEach ->
    Backbone.sync.restore()
    $.get.restore()
    benv.teardown()

  it 'destroys the section when clicking off', ->
    @component.props.section.on 'destroy', spy = sinon.spy()
    @component.onClickOff()
    spy.called.should.be.ok

  it 'fetches embedly iframe on init', ->
    @component.props.section.set url: 'http://google.com'
    @component.componentDidMount()
    $.get.args[0][0].should.containEql 'https://api.embed.ly/1/oembed?maxwidth=500&key=&url=http%3A%2F%2Fgoogle.com'

  it 'gets width for overflow styling', ->
    @component.props.section.set layout: 'overflow'
    @component.getWidth().should.equal 1060

  it 'gets width for column_width styling', ->
    @component.props.section.set layout: 'column_width'
    @component.getWidth().should.equal 500

  it 'changes layout when clicking on layout controls', ->
    r.simulate.click r.find @component, 'ese-overflow'
    @component.props.section.get('layout').should.equal 'overflow'

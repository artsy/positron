benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate
{ div } = React.DOM
fixtures = require '../../../../../../test/helpers/fixtures'

describe 'SectionVideo', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require('jquery'), resize: ->
      SectionVideo = benv.require resolve __dirname, '../index'
      SectionVideo.__set__ 'gemup', @gemup = sinon.stub()
      @component = React.render SectionVideo(
        section: new Backbone.Model
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        editing: false
        setEditing: -> ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        sinon.stub @component, 'forceUpdate'
        sinon.stub $, 'ajax'
        done()

  afterEach ->
    benv.teardown()

  it 'removes itself when clicking off & the section is empty', ->
    @component.props.section.destroy = sinon.stub()
    @component.props.section.set url: ''
    @component.onClickOff()
    @component.props.section.destroy.called.should.be.ok

  it 'changes the video when submitting', ->
    $(@component.refs.input.getDOMNode()).val 'foobar'
    @component.onChangeUrl preventDefault: ->
    @component.props.section.get('url').should.equal 'foobar'

  it 'renders the video url', ->
    $(@component.getDOMNode()).html().should.containEql 'dQw4w9WgXcQ'

  it 'changes the background when radio button is clicked', ->
    r.simulate.click r.find @component, "esv-background-black"
    @component.props.section.get('background_color').should.equal 'black'

  it 'changes the layout when clicked', ->
    r.simulate.click r.find @component, 'esv-overflow-fillwidth'
    @component.props.section.get('layout').should.equal 'overflow_fillwidth'
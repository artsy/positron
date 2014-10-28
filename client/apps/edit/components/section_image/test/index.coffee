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

describe 'SectionImage', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: require 'jquery'
      SectionImage = benv.require resolve __dirname, '../index'
      SectionImage.__set__ 'gemup', @gemup = sinon.stub()
      @component = React.renderComponent SectionImage(
        section: new Backbone.Model { body: 'Foo to the bar' }
        editing: false
        setEditing: -> ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        sinon.stub $, 'ajax'
        done()

  afterEach ->
    $.ajax.restore()
    benv.teardown()

  it 'removes itself when the section is empty', ->
    @component.props.section.destroy = sinon.stub()
    @component.state.src = ''
    @component.onClickOff()
    @component.props.section.destroy.called.should.be.ok

  it 'uploads to gemini', (done) ->
    global.Image = class Image
      constructor: ->
        setTimeout => @onload()
      onload: ->
    @component.upload target: files: ['foo']
    @gemup.args[0][0].should.equal 'foo'
    @gemup.args[0][1].done('fooza')
    setTimeout =>
      @component.setState.args[0][0].src.should.equal 'fooza'
      delete global.Image
      done()

  it 'saves the url after upload', ->
    global.Image = class Image
      constructor: ->
        setTimeout => @onload()
      onload: ->
    @component.upload target: files: ['foo']
    @gemup.args[0][1].done('fooza')
    setTimeout =>
      @component.props.section.get('url').should.equal 'fooza'
      delete global.Image
      done()

  xit 'renders an image', ->
    @component.state.src = 'foobaz'
    @component.render()
    $(@component.getDOMNode()).html().should.containEql 'foobaz'
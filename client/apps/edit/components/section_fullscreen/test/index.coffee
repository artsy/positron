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

describe 'SectionFullscreen', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      SectionFullscreen = benv.require resolve __dirname, '../index'
      SectionImage.__set__ 'gemup', @gemup = sinon.stub()
      @component = React.render SectionFullscreen(
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
    @component.upload target: files: ['foo']
    @gemup.args[0][0].should.equal 'foo'
    @gemup.args[0][1].done('fooza')
    setTimeout =>
      @component.setState.args[0][0].src.should.equal 'fooza'
      done()

  it 'saves the url after upload', (done) ->
    sinon.stub @component, 'onClickOff'
    @component.upload target: files: ['foo']
    @gemup.args[0][1].done('fooza')
    setTimeout =>
      @component.onClickOff.called.should.be.ok
      done()

  xit 'renders an image', ->
    @component.state.src = 'foobaz'
    @component.render()
    $(@component.getDOMNode()).html().should.containEql 'foobaz'

  it 'previews captions on keyup', ->
    $(@component.refs.editable.getDOMNode()).html('foobar')
    @component.onEditableKeyup()
    @component.setState.args[0][0].caption.should.equal 'foobar'

  it 'saves captions on click off', ->
    @component.state.caption = 'foobar'
    @component.state.src = 'foo'
    @component.onClickOff()
    @component.props.section.get('caption').should.equal 'foobar'

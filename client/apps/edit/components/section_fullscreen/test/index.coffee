benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
{ div } = React.DOM
fixtures = require '../../../../../../test/helpers/fixtures'

describe 'SectionFullscreen', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
      SectionFullscreen = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      SectionFullscreen.__set__ 'gemup', @gemup = sinon.stub()
      @component = ReactDOM.render React.createElement(SectionFullscreen,
        section: new Backbone.Model
          type: 'fullscreen'
          title: ''
          background_url: ''
          background_image_url: ''
        editing: false
        setEditing: -> ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'removes itself when the section is empty', ->
    @component.props.section.destroy = sinon.stub()
    @component.state = {}
    @component.onClickOff()
    @component.props.section.destroy.called.should.be.ok

  it 'uploads and saves video to gemini', (done) ->
    @component.upload target: files: ['foo.mp4']
    @gemup.args[0][0].should.equal 'foo.mp4'
    @gemup.args[0][1].done('fooza.mp4')
    setTimeout =>
      @component.setState.args[0][0].background_url.should.equal 'fooza.mp4'
      done()

  it 'uploads and saves image to gemini', (done) ->
    @component.upload target: files: ['foo.jpg']
    @gemup.args[0][0].should.equal 'foo.jpg'
    @gemup.args[0][1].done('fooza.jpg')
    setTimeout =>
      @component.setState.args[0][0].background_image_url.should.equal 'fooza.jpg'
      done()

  it 'saves the url after upload', (done) ->
    sinon.stub @component, 'onClickOff'
    @component.upload target: files: ['foo']
    @gemup.args[0][1].done('fooza')
    setTimeout =>
      @component.onClickOff.called.should.be.ok
      done()

  it 'sets title state on keyup', ->
    $(ReactDOM.findDOMNode(@component.refs.editableTitle)).val('foobar')
    ReactTestUtils.Simulate.keyUp(@component.refs.editableTitle)
    @component.setState.args[0][0].title.should.equal 'foobar'

  it 'saves titles on click off', ->
    @component.state.title = 'foobar'
    @component.onClickOff()
    @component.props.section.get('title').should.equal 'foobar'

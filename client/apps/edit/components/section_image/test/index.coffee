benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate
{ div } = React.DOM
fixtures = require '../../../../../../test/helpers/fixtures'

describe 'SectionImage', ->

  beforeEach (done) ->
    global.Image = class Image
      constructor: ->
        setTimeout => @onload()
      onload: ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      global.HTMLElement = () => {}
      global.HTMLAnchorElement = () => {}
      SectionImage = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      RichTextCaption = benv.requireWithJadeify(
        resolve(__dirname, '../../../../../components/rich_text_caption/index'), ['icons']
      )
      SectionImage.__set__ 'RichTextCaption', React.createFactory(RichTextCaption)
      SectionImage.__set__ 'gemup', @gemup = sinon.stub()
      @component = ReactDOM.render React.createElement(SectionImage,
        section: new Backbone.Model { body: 'Foo to the bar', caption: '<p>hello!</p>' }
        editing: false
        setEditing: -> ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub $, 'ajax'
        done()

  afterEach ->
    $.ajax.restore()
    benv.teardown()
    delete global.Image

  it 'removes itself when the section is empty', ->
    @component.props.section.destroy = sinon.stub()
    @component.state.src = ''
    @component.onClickOff()
    @component.props.section.destroy.called.should.be.ok

  it 'uploads to gemini', (done) ->
    sinon.stub @component, 'setState'
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

  it 'renders a placeholder if no image', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Add an image above'

  it 'renders an image', ->
    @component.setState({ src: 'foobaz.jpg' })
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'foobaz'

  it 'renders a caption', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'hello!'

  it 'previews captions on keyup', ->
    @component.setState({ src: 'foobaz.jpg' })
    @component.onCaptionChange('<p>foobar</p>')
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'foobar'

  it 'saves captions on click off', ->
    @component.state.caption = 'foobar'
    @component.state.src = 'foo'
    @component.onClickOff()
    @component.props.section.get('caption').should.equal 'foobar'

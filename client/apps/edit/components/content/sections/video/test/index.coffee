benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  simulate: ReactTestUtils.Simulate
{ div } = React.DOM
fixtures = require '../../../../../../../../test/helpers/fixtures'

describe 'SectionVideo', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require('jquery'), resize: ->
      global.HTMLElement = () => {}
      SectionVideo = benv.requireWithJadeify(
        resolve __dirname, '../index'
        ['icons']
      )
      RichTextCaption = benv.requireWithJadeify(
        resolve(__dirname, '../../../../../../../components/rich_text_caption/index')
        ['icons']
      )
      SectionVideo.__set__ 'RichTextCaption', React.createFactory(RichTextCaption)
      SectionVideo.__set__ 'gemup', @gemup = sinon.stub()
      SectionVideo.__set__ 'resize', @resize = sinon.stub().returns('http://image.jpg')
      props = {
        section: new Backbone.Model
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          caption: '<p>Rick Astley - Never Gonna Give You Up</p>'
        editing: true
        setEditing: -> ->
        channel: {isEditorial: sinon.stub().returns(true)}
      }
      @component = ReactDOM.render React.createElement(SectionVideo, props), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub $, 'ajax'
        done()

  afterEach ->
    benv.teardown()

  it 'renders the video url', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'dQw4w9WgXcQ'

  it 'renders the cover image', ->
    @component.setState coverSrc: 'http://image.jpg'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'http://image.jpg'

  it 'renders the caption', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Never Gonna Give You Up'

  it 'removes itself when clicking off & the section is empty', ->
    @component.props.section.destroy = sinon.stub()
    @component.props.section.set caption: ''
    @component.props.section.set url: ''
    @component.onClickOff()
    @component.props.section.destroy.called.should.be.ok

  it 'changes the video when submitting', ->
    $(@component.refs.input).val 'https://youtube/foobar'
    @component.onChangeUrl preventDefault: ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql '<iframe src="//www.youtube.com/embed/foobar" height="600px">'

  it 'saves captions on click off', ->
    @component.setState caption: '<p>updated</p>'
    @component.onClickOff()
    @component.props.section.get('caption').should.equal '<p>updated</p>'

  it 'onCaptionChange changes the caption', ->
    @component.onCaptionChange('<p>updated</p>')
    @component.state.caption.should.equal '<p>updated</p>'

  it 'changes the layout when clicked', ->
    r.simulate.click r.find(@component, 'layout')[0]
    @component.props.section.get('layout').should.equal 'overflow_fillwidth'

  it 'removes the cover image when remove-button clicked', ->
    @component.setState coverSrc: 'http://image.jpg'
    r.simulate.click r.find(@component, 'edit-section-remove')[0]
    $(ReactDOM.findDOMNode(@component)).html().should.not.containEql 'http://image.jpg'


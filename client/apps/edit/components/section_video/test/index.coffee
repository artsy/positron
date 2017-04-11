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

describe 'SectionVideo', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require('jquery'), resize: ->
      global.HTMLElement = () => {}
      SectionVideo = benv.require resolve __dirname, '../index'
      RichTextCaption = benv.requireWithJadeify(resolve(__dirname, '../../../../../components/rich_text_caption/index'), ['icons'])
      SectionVideo.__set__ 'RichTextCaption', React.createFactory(RichTextCaption)
      SectionVideo.__set__ 'gemup', @gemup = sinon.stub()
      props = {
        section: new Backbone.Model
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          caption: '<p>Rick Astley - Never Gonna Give You Up</p>'
        editing: false
        setEditing: -> ->
      }
      @rendered = ReactDOMServer.renderToString React.createElement(SectionVideo, props)
      @component = ReactDOM.render React.createElement(SectionVideo, props), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub $, 'ajax'
        done()

  afterEach ->
    benv.teardown()

  it 'removes itself when clicking off & the section is empty', ->
    @component.props.section.destroy = sinon.stub()
    @component.props.section.set caption: ''
    @component.props.section.set url: ''
    @component.onClickOff()
    @component.props.section.destroy.called.should.be.ok

  it 'saves captions on click off', ->
    @component.state.caption = 'updated'
    @component.onClickOff()
    @component.props.section.get('caption').should.equal 'updated'

  it 'changes the caption when submitting', ->
    @component.onCaptionChange('<p>updated</p>')
    $(ReactDOM.findDOMNode(@component)).html().should.containEql '<p>updated</p>'

  it 'changes the video and caption when submitting', ->
    $(@component.refs.input).val 'https://youtube/foobar'
    @component.onChangeUrl preventDefault: ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql '<iframe src="//www.youtube.com/embed/foobar" width="100%" height="313px">'

  it 'renders the video url', ->
    $(@rendered).html().should.containEql 'dQw4w9WgXcQ'

  it 'renders the caption', ->
    $(@rendered).html().should.containEql 'Never Gonna Give You Up'

  it 'changes the background when radio button is clicked', ->
    r.simulate.click r.find @component, "esv-background-black"
    @component.state.background_color.should.equal 'black'

  it 'changes the layout when clicked', ->
    r.simulate.click r.find @component, 'esv-overflow-fillwidth'
    @component.state.layout.should.equal 'overflow_fillwidth'

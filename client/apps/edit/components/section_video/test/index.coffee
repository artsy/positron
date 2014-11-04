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
      benv.expose $: require 'jquery'
      SectionVideo = benv.require resolve __dirname, '../index'
      SectionVideo.__set__ 'gemup', @gemup = sinon.stub()
      @component = React.render SectionVideo(
        section: new Backbone.Model
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        editing: false
        setEditing: -> ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        sinon.stub $, 'ajax'
        done()

  afterEach ->
    $.ajax.restore()
    benv.teardown()

  it 'removes itself when clicking off & the section is empty', ->
    @component.props.section.destroy = sinon.stub()
    @component.state.src = ''
    @component.onClickOff()
    @component.props.section.destroy.called.should.be.ok

  it 'changes the video when submitting', ->
    $(@component.refs.input.getDOMNode()).val 'foobar'
    @component.onSubmit preventDefault: ->
    @component.setState.args[0][0].src.should.equal 'foobar'

  it 'converts youtube urls to an iframe frriendly one', ->
    @component.state.src = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    @component.getIframeUrl().should.equal '//www.youtube.com/embed/dQw4w9WgXcQ'
    @component.state.src = 'http://youtu.be/dQw4w9WgXcQ'
    @component.getIframeUrl().should.equal '//www.youtube.com/embed/dQw4w9WgXcQ'

  it 'converts vimeo urls to an iframe frriendly one', ->
    @component.state.src = 'http://vimeo.com/87031388'
    @component.getIframeUrl().should
      .equal "//player.vimeo.com/video/87031388?color=ffffff"

  it 'renders the video url', ->
    $(@component.getDOMNode()).html().should.containEql 'dQw4w9WgXcQ'


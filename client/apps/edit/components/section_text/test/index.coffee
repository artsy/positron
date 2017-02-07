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

describe 'SectionText', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      SectionText = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      class @Scribe
        use: ->
      SectionText.__set__ 'Scribe', @Scribe
      SectionText.__set__ 'isEditorialTeam', sinon.stub().returns(true)
      for name in ['scribePluginToolbar', 'scribePluginSanitizer',
        'scribePluginLinkTooltip', 'scribePluginKeyboardShortcuts',
        'scribePluginHeadingCommand', 'scribePluginSanitizeGoogleDoc', 'scribePluginJumpLink', 'scribePluginFollowLinkTooltip']
        SectionText.__set__ name, sinon.stub()
      SectionText::attachScribe = sinon.stub()
      props = {
        section: new Backbone.Model { body: '<p>Foo to the bar</p>', type: 'text' }
        onSetEditing: @onSetEditing = sinon.stub()
        setEditing: @setEditing = sinon.stub()
        editing: false
        key: 4
      }
      @rendered = ReactDOMServer.renderToString React.createElement(SectionText, props)
      @component = ReactDOM.render React.createElement(SectionText, props), $("<div></div>")[0], ->
        setTimeout -> done()


  afterEach ->
    benv.teardown()

  xit "updates the section's body", ->
    @component.refs.editable.value = 'Hello'
    @component.setBody()
    @component.props.section.get('body').should.equal 'Hello'

  it 'removes the section if they click off and its empty', ->
    @component.props.section.destroy = sinon.stub()
    @component.props.section.set body: ''
    @component.onClickOff()
    @component.props.section.destroy.called.should.be.ok

  xit 'updates the body on click off', ->
    @component.props.section.destroy = sinon.stub()
    @component.props.section.set body: ''
    $(@component.refs.editable).html 'Hello'
    @component.onClickOff()
    @component.props.section.get('body').should.equal 'Hello'

  it 'doesnt update while editing b/c Scribe will jump around all weird', ->
    @component.props.editing = true
    @component.shouldComponentUpdate({ editing: true }).should.not.be.ok

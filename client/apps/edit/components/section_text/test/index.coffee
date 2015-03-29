benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate

describe 'SectionText', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: require 'jquery'
      SectionText = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      class @Scribe
        use: ->
      SectionText.__set__ 'Scribe', @Scribe
      for name in ['scribePluginToolbar', 'scribePluginSanitizer',
        'scribePluginLinkTooltip', 'scribePluginKeyboardShortcuts',
        'scribePluginHeadingCommand', 'scribePluginSanitizeGoogleDoc']
        SectionText.__set__ name, sinon.stub()
      SectionText::attachScribe = sinon.stub()
      @component = React.render SectionText(
        section: new Backbone.Model { body: 'Foo to the bar' }
        onSetEditing: @onSetEditing = sinon.stub()
        setEditing: @setEditing = sinon.stub()
        editing: false
        key: 4
      ), $("<div></div>")[0], -> setTimeout -> done()

  afterEach ->
    benv.teardown()

  it "updates the section's body", ->
    $(@component.refs.editable.getDOMNode()).html 'Hello'
    @component.setBody()
    @component.props.section.get('body').should.equal 'Hello'

  it 'removes the section if they click off and its empty', ->
    @component.props.section.destroy = sinon.stub()
    @component.props.section.set body: ''
    @component.onClickOff()
    @component.props.section.destroy.called.should.be.ok

  it 'doesnt update while editing b/c Scribe will jump around all weird', ->
    @component.props.editing = true
    @component.shouldComponentUpdate({ editing: true }).should.not.be.ok

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
        'scribePluginHeadingCommand']
        SectionText.__set__ name, sinon.stub()
      @component = React.render SectionText(
        section: new Backbone.Model { body: 'Foo to the bar' }
        onSetEditing: @onSetEditing = sinon.stub()
        setEditing: @setEditing = sinon.stub()
        editing: false
        key: 4
      ), $("<div></div>")[0], -> setTimeout -> done()

  afterEach ->
    benv.teardown()

  it "updates the section's body on keyup", ->
    $(@component.refs.editable.getDOMNode()).html 'Hello'
    @component.onKeyUp()
    @component.props.section.get('body').should.equal 'Hello'

  it 'removes the section if they click off and its empty', ->
    @component.props.section.destroy = sinon.stub()
    @component.props.section.set body: ''
    @component.onClickOff()
    @component.props.section.destroy.called.should.be.ok
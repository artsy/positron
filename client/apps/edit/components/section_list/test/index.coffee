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

describe 'SectionList', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: require 'jquery'
      SectionList = benv.require resolve(__dirname, '../index')
      SectionList.__set__ 'SectionText', React.createClass
        render: ->
          div {}, @props.section.get('body')
      SectionList.__set__ 'SectionTool', ->
      @component = React.renderComponent SectionList(
        sections: @sections = new Backbone.Collection [
          { body: 'Foo to the bar', type: 'text' }
          { body: 'Foo to the bar', type: 'text' }
        ]
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        @component.setState = sinon.stub()
        done()

  afterEach ->
    benv.teardown()

  it 'renders the sections', ->
    @$el.html().should.containEql 'Foo to the bar'

  it 'opens editing mode in the last added section', ->
    @component.props.sections.add { body: 'Hello World', type: 'text' }
    @component.setState.args[0][0].editingIndex.should.equal 2

  it 'toggles editing state when a child section callsback', ->
    @component.refs.text1.props.onSetEditing 2
    @component.setState.args[0][0].editingIndex.should.equal 2

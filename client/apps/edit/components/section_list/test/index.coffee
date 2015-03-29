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
      SectionList.__set__ 'SectionTool', ->
      SectionList.__set__ 'SectionContainer', @SectionContainer = sinon.stub()
      @component = React.render SectionList(
        sections: @sections = new Backbone.Collection [
          { body: 'Foo to the bar', type: 'text' }
          { body: 'Foo to the bar', type: 'text' }
        ]
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        @component.setState = sinon.stub()
        @component.props.sections.off()
        done()

  afterEach ->
    benv.teardown()

  xit 'renders the sections', ->
    @$el.html().should.containEql 'Foo to the bar'

  it 'opens editing mode in the last added section', ->
    @component.onNewSection @component.props.sections.last()
    @component.setState.args[0][0].editingIndex.should.equal 1

  it 'toggles editing state when a child section callsback', ->
    @SectionContainer.args[0][0].onSetEditing
      .should.equal @component.onSetEditing

  it 'uses the section cid as a key b/c they have to be unique AND a \
      property specific to that piece of data, or model in our case', ->
    @component.render()
    @SectionContainer.args[0][0].key.should.equal @sections.at(0).cid
    @SectionContainer.args[1][0].key.should.equal @sections.at(1).cid

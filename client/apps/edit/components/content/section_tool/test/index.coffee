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
  findAll: ReactTestUtils.scryRenderedDOMComponentsWithClass
rewire = require 'rewire'
User = rewire '../../../../../../models/user.coffee'
fixtures = require '../../../../../../../test/helpers/fixtures'

describe 'SectionTool', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      @SectionTool = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      @SectionTool.__set__ 'User', User
      @SectionTool.__set__ 'sd',
        USER: type: 'Admin', email: 'kana@artsymail.com'
        CURRENT_CHANNEL: fixtures().channels
      props = {
        sections: @sections = new Backbone.Collection [
          { body: '<p>Foo to the bar</p>', type: 'text' }
          { body: '<p>Foo to the bar <a class="is-jump-link" name="andy">Andy</a></p>', type: 'text' }
        ]
        index: 2
        toggleEditMode: @toggleEditMode = sinon.stub()
      }
      @component = ReactDOM.render React.createElement(@SectionTool, props), $("<div></div>")[0], -> setTimeout -> done()

  afterEach ->
    benv.teardown()

  it 'opens on click', ->
    r.simulate.click r.find @component, 'edit-section-tool-icon'
    @component.state.open.should.equal true

  it 'adds a new text section when clicking on it', ->
    r.simulate.click r.find @component, 'edit-section-tool-text'
    @component.props.sections.last().get('type').should.equal 'text'
    @component.props.sections.last().get('body').should.equal ''

describe 'SectionTool - Hero', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
      SectionTool = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      SectionTool.__set__ 'sd',
        USER: type: 'Admin', email: 'kana@artsymail.com'
        CURRENT_CHANNEL: fixtures().channels
      props = {
        sections: new Backbone.Collection [
          { type: 'fullscreen' }
        ]
        hero: true
        setHero: ->
        index: 2
        toggleEditMode: @toggleEditMode = sinon.stub()
      }
      @component = ReactDOM.render React.createElement(SectionTool, props), $("<div></div>")[0], -> setTimeout -> done()
      @rendered = ReactDOMServer.renderToString React.createElement(SectionTool, props)

  afterEach ->
    benv.teardown()

  it 'adds a new fullscreen section when clicking on it', ->
    r.simulate.click r.find @component, 'edit-section-tool-hero-fullscreen'
    @component.props.sections.first().get('type').should.equal 'fullscreen'

benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate
  findAll: React.addons.TestUtils.scryRenderedDOMComponentsWithClass
rewire = require 'rewire'
User = rewire '../../../../../models/user.coffee'
fixtures = require '../../../../../../test/helpers/fixtures'

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
      @component = React.render @SectionTool(
        sections: @sections = new Backbone.Collection [
          { body: '<p>Foo to the bar</p>', type: 'text' }
          { body: '<p>Foo to the bar <a class="is-jump-link" name="andy">Andy</a></p>', type: 'text' }
        ]
        index: 2
        toggleEditMode: @toggleEditMode = sinon.stub()
      ), $("<div></div>")[0], -> setTimeout -> done()

  afterEach ->
    benv.teardown()

  it 'opens on click', ->
    r.simulate.click r.find @component, 'edit-section-tool-icon'
    @component.state.open.should.equal true

  it 'adds a new text section when clicking on it', ->
    r.simulate.click r.find @component, 'edit-section-tool-text'
    @component.props.sections.last().get('type').should.equal 'text'
    @component.props.sections.last().get('body').should.equal ''

  it 'does not show a callout section if there is not a text section below it', ->
    r.simulate.click r.find @component, 'edit-section-tool-icon'
    (r.findAll @component, 'edit-section-tool-callout')[0].props.className.should.containEql 'is-disabled'
    React.renderToString(@SectionTool(
        sections: @sections = new Backbone.Collection [
          { body: 'Foo to the bar', type: 'text' }
        ]
        index: 0
    )).should.containEql 'edit-section-tool-callout is-disabled'

  it 'shows a callout section if there is a text section below it', ->
    React.renderToString(@SectionTool(
        sections: @sections = new Backbone.Collection [
          { body: 'Foo to the bar', type: 'text' }
        ]
        index: -1
    )).should.containEql 'edit-section-tool-callout'

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
      @component = React.render SectionTool(
        sections: new Backbone.Collection [
          { type: 'fullscreen' }
        ]
        hero: true
        hasSection: false
        setHero: ->
        index: 2
        toggleEditMode: @toggleEditMode = sinon.stub()
      ), $("<div></div>")[0], -> setTimeout -> done()

  afterEach ->
    benv.teardown()

  it 'adds a new fullscreen section when clicking on it', ->
    r.simulate.click r.find @component, 'edit-section-tool-hero-fullscreen'
    @component.props.sections.first().get('type').should.equal 'fullscreen'

  it 'disables the fullscreen section when a section exists on the article', ->
    @component.props.hasSection = true
    (r.find @component, 'edit-section-tool-hero-fullscreen').props.onClick?.should.be.false

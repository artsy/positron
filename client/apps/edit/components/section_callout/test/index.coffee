benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
_ = require 'underscore'
Article = require '../../../../../models/article.coffee'
Section = require '../../../../../models/section.coffee'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate
{ div } = React.DOM
{ fabricate } = require 'antigravity'

describe 'SectionCallout', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      @SectionCallout = benv.require resolve __dirname, '../index'
      @SectionCallout.__set__ 'Autocomplete', sinon.stub()
      @component = React.render @SectionCallout(
        section: new Section { article: '', text: '', type: 'callout' }
        editing: true
        setEditing: ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        sinon.stub Backbone, 'sync'
        done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown()

  it 'destroys the section when clicking off with no article or pull quote', ->
    @component.props.section.on 'destroy', spy = sinon.spy()
    @component.onClickOff()
    spy.called.should.be.ok

  xit 'renders an article', ->
    render = React.renderToString(@SectionCallout
      section: @sections = new Section
        type: 'callout'
        text: 'Test Title'
        article: '123'
      setEditing: ->
      editing: true
    )
    render.should.containEql 'Test Title'
    render.should.containEql 'is-article'

  it 'renders a pull quote', ->
    render = React.renderToString(@SectionCallout
      section: @sections = new Section
        type: 'callout'
        text: 'Test Title'
      setEditing: ->
      editing: true
    )
    render.should.containEql 'Test Title'
    render.should.containEql 'is-pull-quote'

  it 'adds an article onSelect', ->
    @component.onSelect({},{ id: '123', value: 'Foo Title', thumbnail: '' })
    _.defer => @component.props.section.get('article').should.equal '123'

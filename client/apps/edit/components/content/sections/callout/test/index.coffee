benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
_ = require 'underscore'
Article = require '../../../../../../../models/article.coffee'
Section = require '../../../../../../../models/section.coffee'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate
{ div } = React.DOM
{ fabricate } = require 'antigravity'

describe 'SectionCallout', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      @SectionCallout = benv.require resolve __dirname, '../index'
      @SectionCallout.__set__ 'Autocomplete', sinon.stub()
      props = {
        section: new Section { article: '', text: '', type: 'callout' }
        editing: true
        setEditing: ->
      }
      @component = ReactDOM.render React.createElement(@SectionCallout, props), (@$el = $ "<div></div>")[0], => setTimeout =>
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

  it 'renders an article and callout header', ->
    render = ReactDOMServer.renderToString React.createElement(@SectionCallout,
      section: @sections = new Section
        type: 'callout'
        text: 'Test Title'
        article: '123'
      setEditing: ->
      editing: true
    )
    render.should.containEql 'Test Title'
    render.should.containEql 'Related Article'

  it 'renders a pull quote', ->
    props = {
      section: @sections = new Section
        type: 'callout'
        text: 'Test Title'
      setEditing: ->
      editing: true
    }
    render = ReactDOMServer.renderToString React.createElement(@SectionCallout, props)
    render.should.containEql 'Test Title'
    render.should.containEql 'is-pull-quote'

  it 'adds an article onSelect', ->
    @component.onSelect({},{ id: '123', value: 'Foo Title', thumbnail: '' })
    Backbone.sync.args[0][2].success _.extend fabricate('article'), {id: '123'}

  it 'renders a top stories callout', ->
    render = ReactDOMServer.renderToString React.createElement(@SectionCallout,
      section: @sections = new Section
        type: 'callout'
        top_stories: true
      setEditing: ->
      editing: true
    )
    render.should.containEql 'Top Stories'

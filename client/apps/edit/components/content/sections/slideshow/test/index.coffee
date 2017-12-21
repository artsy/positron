benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-dom/test-utils'
ReactDOMServer = require 'react-dom/server'
Section = require '../../../../../../../models/section'
fixtures = require '../../../../../../../../test/helpers/fixtures'

describe 'SectionSlideshow', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      @SectionSlideshow = benv.require resolve __dirname, '../index'
      sinon.stub Backbone, 'sync'
      @component = ReactDOM.render React.createElement(@SectionSlideshow,
        section: new Section { type: 'slideshow', items: [
          { type: 'artwork', id: 'foo' }
          { type: 'artwork', id: 'bar' }
        ] }
        editing: false
        setEditing: ->
        changeLayout: ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown()

  it 'fetches the artworks on mount', ->
    @component.componentDidMount()
    Backbone.sync.args[0][1].url().should.containEql 'foo'
    Backbone.sync.args[1][1].url().should.containEql 'bar'

  it 'renders the images', ->
    rendered = ReactDOMServer.renderToString React.createElement(@SectionSlideshow,
      section: new Section { type: 'slideshow', items: [
        { type: 'image', url: 'http://foobar.jpg' }
      ] }
      editing: false
      setEditing: ->
      changeLayout: ->
    )
    $(rendered).html().should.containEql 'http://foobar.jpg'

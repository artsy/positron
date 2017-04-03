benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
# _ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
# ReactDOMServer = require 'react-dom/server'
fixtures = require '../../../../../../test/helpers/fixtures.coffee'
Article = require '../../../../../models/article.coffee'
Backbone = require 'backbone'

r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'AdminArticle', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      Backbone.$ = $
      $.onInfiniteScroll = sinon.stub()
      AdminArticle = benv.require resolve __dirname, '../article/index.coffee'
      AdminArticle.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
        USER: access_token: ''
      }
      @channel = {id: '123'}
      @article = new Article
      @article.attributes = fixtures().articles
      props = {
        article: @article
        channel: @channel
        onChange: sinon.stub()
        }
      @component = ReactDOM.render React.createElement(AdminArticle, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          # sinon.stub @component, 'setupAutocomplete'
          done()

  afterEach ->
    benv.teardown()

  it 'renders the fields', ->
    console.log @component.state

  xit 'Inputs are populated with article data', ->

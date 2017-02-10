benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'QueuedArticles', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      QueuedArticles = benv.requireWithJadeify(
        resolve(__dirname, '../../client/queued')
        []
      )
      QueuedArticles.__set__ 'sd', { FORCE_URL: 'http://artsy.net' }
      QueuedArticles.__set__ 'ArticleList', sinon.stub()
      props = {
          articles: [{id: '123', thumbnail_title: 'Game of Thrones', slug: 'artsy-editorial-game-of-thrones'}]
          selected: sinon.stub()
          headerText: 'Queued'
        }
      @rendered = ReactDOMServer.renderToString React.createElement(QueuedArticles, props)
      done()

  afterEach ->
    benv.teardown()

  it 'renders a header', ->
    $(@rendered).html().should.containEql 'Queued'

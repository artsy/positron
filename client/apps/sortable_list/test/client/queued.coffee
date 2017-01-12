benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate

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
      @component = React.render QueuedArticles(
        {
          articles: [{id: '123', thumbnail_title: 'Game of Thrones', slug: 'artsy-editorial-game-of-thrones'}]
          selected: sinon.stub()
          headerText: 'Queued'
        }
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'renders a header', ->
    $(@component.getDOMNode()).html().should.containEql 'Queued'

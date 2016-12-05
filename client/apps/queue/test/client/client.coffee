benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
_ = require 'underscore'
React = require 'react'
fixtures = require '../../../../../test/helpers/fixtures.coffee'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate

describe 'QueuedView', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      { QueueView } = mod =  benv.require resolve(__dirname, '../../client/client')
      mod.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
      }
      mod.__set__ 'FilterSearch', @FilterSearch = sinon.stub()
      mod.__set__ 'QueuedArticles', @QueuedArticles = sinon.stub()
      @request =
        post: sinon.stub().returns
          send: sinon.stub().returns
            end: sinon.stub().yields(
              null,
              body: data: articles: [fixtures().articles, fixtures().articles]
            )
      mod.__set__ 'request', @request
      @component = React.render QueueView(
        {
          publishedArticles: [_.extend fixtures().articles, id: '123']
          queuedArticles: [_.extend fixtures().articles, id: '456']
          feed: 'daily_email'
        }
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'saveSelected'
        done()

  afterEach ->
    benv.teardown()

  it 'renders the nav', ->
    $(@component.getDOMNode()).html().should.containEql 'Daily Email'
    $(@component.getDOMNode()).html().should.containEql 'Weekly Email'

  it 'queuedArticles and publishedArticles get passed along to components', ->
    @component.state.queuedArticles.length.should.equal 1
    @component.state.publishedArticles.length.should.equal 1
    @FilterSearch.args[0][0].url.should.containEql 'channel_id=123'
    @FilterSearch.args[0][0].articles.length.should.equal 1
    @QueuedArticles.args[0][0].articles.length.should.equal 1

  it 'updates the feed', ->
    r.simulate.click r.find @component, 'weekly-email'
    @component.state.feed.should.equal 'weekly_email'
    @request.post.callCount.should.equal 1
    @component.state.queuedArticles.length.should.equal 2

  it 'updates state on selected', ->
    @component.selected(_.extend(fixtures().articles, id: '123'), 'select')
    @component.state.publishedArticles.length.should.equal 0
    @component.state.queuedArticles.length.should.equal 2

  it 'updates state on unselected', ->
    @component.selected(_.extend(fixtures().articles, id: '456'), 'unselect')
    @component.state.publishedArticles.length.should.equal 2
    @component.state.queuedArticles.length.should.equal 0

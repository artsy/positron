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
        USER: access_token: ''
      }
      mod.__set__ 'FilterSearch', @FilterSearch = sinon.stub()
      mod.__set__ 'QueuedArticles', @QueuedArticles = sinon.stub()
      mod.__set__ 'ArticleList', @ArticleList = sinon.stub()
      @request =
        post: sinon.stub().returns
          set: sinon.stub().returns
            send: sinon.stub().returns
              end: sinon.stub().yields(
                null,
                body: data: articles: [fixtures().articles, fixtures().articles]
              )
      mod.__set__ 'request', @request
      @component = React.render QueueView(
        {
          scheduledArticles: [_.extend fixtures().articles, id: '456']
          feed: 'scheduled'
          channel: {name: 'Artsy Editorial'}
        }
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'saveSelected'
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'renders the nav', ->
    $(@component.getDOMNode()).html().should.containEql 'Scheduled'
    $(@component.getDOMNode()).html().should.containEql 'Daily Email'
    $(@component.getDOMNode()).html().should.containEql 'Weekly Email'
    $(@component.getDOMNode()).html().should.containEql 'Artsy Editorial'

  it 'scheduledArticles gets passed along to components', ->
    @component.state.scheduledArticles.length.should.equal 1
    @ArticleList.args[0][0].articles.length.should.equal 1

  it 'updates feed for daily panel', ->
    @component.fetchFeed 'daily_email'
    @request.post.callCount.should.equal 2
    @component.setState.args[0][0].queuedArticles.length.should.equal 2
    @component.setState.args[1][0].publishedArticles.length.should.equal 2

  it 'updates feed for weekly panel', ->
    @component.fetchFeed 'weekly_email'
    @request.post.callCount.should.equal 2
    @component.setState.args[0][0].queuedArticles.length.should.equal 2
    @component.setState.args[1][0].publishedArticles.length.should.equal 2

  it 'updates feed for scheduled panel', ->
    @component.fetchFeed 'scheduled'
    @request.post.callCount.should.equal 1
    @component.setState.args[0][0].scheduledArticles.length.should.equal 2

  it 'updates state on selected', ->
    @component.selected(_.extend(fixtures().articles, id: '123'), 'select')
    @component.setState.args[0][0].publishedArticles.length.should.equal 0
    @component.setState.args[0][0].queuedArticles.length.should.equal 1

  it 'updates state on unselected', ->
    @component.selected(_.extend(fixtures().articles, id: '456'), 'unselect')
    @component.setState.args[0][0].publishedArticles.length.should.equal 1
    @component.setState.args[0][0].queuedArticles.length.should.equal 0

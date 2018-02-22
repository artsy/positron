benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-dom/test-utils'
ReactDOMServer = require 'react-dom/server'
fixtures = require '../../../../../test/helpers/fixtures.coffee'
QueueView = require '../../client/client'

r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'QueueView', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      { QueueView } = mod = benv.require resolve(__dirname, '../../client/client')
      mod.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
        USER: access_token: ''
      }
      mod.__set__ 'FilterSearch', @FilterSearch = sinon.stub()
      mod.__set__ 'QueuedArticles', @QueuedArticles = sinon.stub()

      @request =
        post: sinon.stub().returns
          set: sinon.stub().returns
            send: sinon.stub().returns
              end: sinon.stub().yields(
                null,
                body: data: articles: [fixtures().articles, fixtures().articles]
              )
      mod.__set__ 'request', @request
      @props = {
          scheduledArticles: [_.extend fixtures().articles, id: '456']
          feed: 'scheduled'
          channel: {name: 'Artsy Editorial'}
        }
      @rendered = ReactDOMServer.renderToString React.createElement(QueueView, @props)
      @component = ReactDOM.render React.createElement(QueueView, @props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          sinon.stub @component, 'saveSelected'
          sinon.stub @component, 'setState'
          done()

  afterEach ->
    benv.teardown()

  it 'renders the nav', ->
    $(@rendered).html().should.containEql 'Scheduled'
    $(@rendered).html().should.containEql 'Daily Email'
    $(@rendered).html().should.containEql 'Weekly Email'
    $(@rendered).html().should.containEql 'Artsy Editorial'
  
  it 'renders the list of articles', ->
    $('.paginated-list-item h1', @rendered).html().should.containEql 'Top Ten Booths at miart 2014'

  it 'scheduledArticles gets passed along to components', ->
    @component.state.scheduledArticles.length.should.equal 1
    $('.article-list__article', @rendered).attr('href').should.equal '/articles/456/edit'

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

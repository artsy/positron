benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-dom/test-utils'
ReactDOMServer = require 'react-dom/server'
fixtures = require '../../../../../test/helpers/fixtures.coffee'
Channel = require '../../../../../client/models/channel.coffee'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'ArticlesListView', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      $.onInfiniteScroll = sinon.stub()
      { ArticlesListView } = mod = benv.requireWithJadeify(
        resolve(__dirname, '../../client/client'),
        ['icons']
      )
      mod.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
        USER: access_token: ''
        ARTICLES: [_.extend fixtures().articles]
      }
      mod.__set__ 'FilterSearch', @FilterSearch = sinon.stub()
      props = {
          articles: [_.extend fixtures().articles, id: '456']
          published: true
          offset: 0
          channel: new Channel {name: 'Artsy Editorial'}
        }
      @rendered = ReactDOMServer.renderToString React.createElement(ArticlesListView, props)
      @component = ReactDOM.render React.createElement(ArticlesListView, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          sinon.stub @component, 'setState'
          done()

  afterEach ->
    benv.teardown()

  it 'renders the nav', ->
    $(@rendered).html().should.containEql 'Published'
    $(@rendered).html().should.containEql 'Drafts'
    $(@rendered).html().should.containEql 'Artsy Editorial'

  it 'articles get passed along to list component', ->
    @component.state.articles.length.should.equal 1
    @FilterSearch.args[0][0].collection.length.should.equal 1

  it 'updates feed when nav is clicked', ->
    @component.state.published.should.equal true
    r.simulate.click r.find @component, 'drafts'
    @component.setState.args[0][0].published.should.equal false

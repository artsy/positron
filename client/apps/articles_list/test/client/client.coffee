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

describe 'ArticlesListView', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      $.onInfiniteScroll = sinon.stub()
      { ArticlesListView } = mod =  benv.require resolve(__dirname, '../../client/client')
      mod.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
        USER: access_token: ''
      }
      mod.__set__ 'FilterSearch', @FilterSearch = sinon.stub()
      @component = React.render ArticlesListView(
        {
          articles: [_.extend fixtures().articles, id: '456']
          published: true
          offset: 0
        }
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'renders the nav', ->
    $(@component.getDOMNode()).html().should.containEql 'Published'
    $(@component.getDOMNode()).html().should.containEql 'Drafts'

  it 'articles get passed along to list component', ->
    @component.state.articles.length.should.equal 1
    @FilterSearch.args[0][0].articles.length.should.equal 1

  it 'updates feed when nav is clicked', ->
    @component.state.published.should.equal true
    r.simulate.click r.find @component, 'drafts'
    @component.setState.args[0][0].published.should.equal false
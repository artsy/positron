benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
fixtures = require '../../../../test/helpers/fixtures.coffee'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

# FIXME: ReferenceError: Bloodhound is not defined
describe.skip 'FilterSearch Article', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      require 'typeahead.js'
      FilterSearch = benv.requireWithJadeify(
        resolve(__dirname, '../index')
        []
      )
      ArticleList = benv.requireWithJadeify(
        resolve(__dirname, '../../article_list/index')
        ['icons']
      )
      ArticleList.__set__ 'sd', { FORCE_URL: 'http://artsy.net' }
      FilterSearch.__set__ 'sd', { FORCE_URL: 'http://artsy.net' }
      FilterSearch.__set__ 'ArticleList', React.createFactory(ArticleList)
      props = {
          collection: [{id: '123', thumbnail_title: 'Game of Thrones', slug: 'artsy-editorial-game-of-thrones'}]
          url: 'url'
          selected: sinon.stub()
          checkable: true
          searchResults: sinon.stub()
          contentType: 'article'
        }
      @component = ReactDOM.render React.createElement(FilterSearch, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          sinon.stub @component, 'setState'
          sinon.stub @component, 'addAutocomplete'
          sinon.stub(@component.engine, 'get').yields [[{id: '456', thumbnail_title: 'finding nemo'}]]
          done()

  afterEach ->
    benv.teardown()

  it 'renders an initial set of articles', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Game of Thrones'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'http://artsy.net/article/artsy-editorial-game-of-thrones'

  it 'selects the article when clicking the check button', ->
    r.simulate.click r.find @component, 'article-list__checkcircle'
    @component.props.selected.args[0][0].id.should.containEql '123'
    @component.props.selected.args[0][0].thumbnail_title.should.containEql 'Game of Thrones'
    @component.props.selected.args[0][0].slug.should.containEql 'artsy-editorial-game-of-thrones'

  it 'searches articles given a query', ->
    input = r.find @component, 'bordered-input'
    input.value = 'finding nemo'
    r.simulate.change input
    @component.props.searchResults.args[0][0][0].id.should.equal '456'
    @component.props.searchResults.args[0][0][0].thumbnail_title.should.equal 'finding nemo'

# FIXME:
describe.skip 'FilterSearch Tag', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      require 'typeahead.js'
      FilterSearch = benv.requireWithJadeify(
        resolve(__dirname, '../index')
        []
      )
      TagList = benv.requireWithJadeify(
        resolve(__dirname, '../../tag_list/index')
        []
      )
      TagList.__set__ 'sd', { FORCE_URL: 'http://artsy.net' }
      FilterSearch.__set__ 'sd', { FORCE_URL: 'http://artsy.net' }
      FilterSearch.__set__ 'TagList', React.createFactory(TagList)
      props = {
        collection: [
          fixtures().tags
          { id: '123', name: 'Berlin', public: true }
        ]
        url: 'url'
        searchResults: sinon.stub()
        deleteTag: sinon.stub()
        contentType: 'tag'
      }
      @component = ReactDOM.render React.createElement(FilterSearch, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          sinon.stub @component, 'setState'
          sinon.stub @component, 'addAutocomplete'
          sinon.stub(@component.engine, 'get').yields [[{id: '123', name: 'Berlin'}]]
          done()

  afterEach ->
    benv.teardown()

  it 'renders an initial set of tags', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Show Reviews'

  it 'searches tags given a query', ->
    input = r.find @component, 'bordered-input'
    input.value = 'Berlin'
    r.simulate.change input
    @component.props.searchResults.args[0][0][0].id.should.equal '123'
    @component.props.searchResults.args[0][0][0].name.should.equal 'Berlin'

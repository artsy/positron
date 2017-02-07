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

describe 'FilterSearch', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      require 'typeahead.js'
      FilterSearch = benv.requireWithJadeify(
        resolve(__dirname, '../index')
        ['icons']
      )
      FilterSearch.__set__ 'sd', { FORCE_URL: 'http://artsy.net' }
      props = {
          articles: [{id: '123', thumbnail_title: 'Game of Thrones', slug: 'artsy-editorial-game-of-thrones'}]
          url: 'url'
          selected: sinon.stub()
          checkable: true
          searchResults: sinon.stub()
        }
      @rendered = ReactDOMServer.renderToString React.createElement(FilterSearch, props)
      @component = ReactDOM.render React.createElement(FilterSearch, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          sinon.stub @component, 'setState'
          sinon.stub @component, 'addAutocomplete'
          sinon.stub(@component.engine, 'get').yields [0,0,[{id: '456', thumbnail_title: 'finding nemo'}]]
          done()

  afterEach ->
    benv.teardown()

  xit 'renders an initial set of articles', ->
    $(@rendered).html().should.containEql 'Game of Thrones'
    $(@rendered).html().should.containEql 'http://artsy.net/article/artsy-editorial-game-of-thrones'

  it 'selects the article when clicking the check button', ->
    r.simulate.click r.find @component, 'filter-search__checkcircle'
    @component.props.selected.args[0][0].id.should.containEql '123'
    @component.props.selected.args[0][0].thumbnail_title.should.containEql 'Game of Thrones'
    @component.props.selected.args[0][0].slug.should.containEql 'artsy-editorial-game-of-thrones'

  it 'searches articles given a query', ->
    @component.refs.searchQuery.val = 'finding nemo'
    @component.refs.searchQuery.props.onKeyUp()
    @component.props.searchResults.args[0][0][0].id.should.equal '456'
    @component.props.searchResults.args[0][0][0].thumbnail_title.should.equal 'finding nemo'

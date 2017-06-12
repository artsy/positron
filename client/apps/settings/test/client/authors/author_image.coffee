_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
fixtures = require '../../../../../../test/helpers/fixtures'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'AuthorsView', ->

  beforeEach (done) ->
    benv.setup =>
      { AuthorsView } = mod = benv.requireWithJadeify(
        resolve(__dirname, '../../client/authors/')
        []
      )
      mod.__set__ 'AuthorImage', @AuthorImage = sinon.stub()
      # mod.__set__ 'sd', { API_URL: 'https://writer.artsy.net/api' }
      # mod.__set__ 'request', @request
      sinon.stub Backbone, 'sync'
      props = authors: [fixtures().authors]
      @rendered = ReactDOMServer.renderToString(
        React.createElement(AuthorsView, props)
      )
      @component = ReactDOM.render(
        React.createElement(AuthorsView, props),
        (@$el = $ "<div></div>")[0],
        =>
      )
      done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown()

  it 'renders list of authors', ->
    @rendered.should.containEql 'Halley Johnson'

  it 'opens the modal with an empty author on Add Author', ->
    r.simulate.click r.find @component, 'authors-header__add-author'
    console.log @AuthorModal.args

  it 'opens the modal with an author on Edit Author', ->
    r.simulate.click r.find @component, 'authors-list__item-edit'
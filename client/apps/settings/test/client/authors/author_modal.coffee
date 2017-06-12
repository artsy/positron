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

describe 'AuthorModal', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      AuthorModal = benv.requireWithJadeify(
        resolve(__dirname, '../../../client/authors/author_modal')
        []
      )
      AuthorModal.__set__ 'AuthorImage', @AuthorImage = sinon.stub()
      props = author: fixtures().authors
      @rendered = ReactDOMServer.renderToString(
        React.createElement(AuthorModal, props)
      )
      @component = ReactDOM.render(
        React.createElement(AuthorModal, props),
        (@$el = $ "<div></div>")[0],
        =>
      )
      done()

  afterEach ->
    benv.teardown()

  it 'renders author form', ->
    @rendered.should.containEql 'Halley Johnson'

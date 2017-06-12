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
      benv.expose $: benv.require 'jquery'
      { AuthorsView } = mod = benv.requireWithJadeify(
        resolve(__dirname, '../../../client/authors/index')
        []
      )
      mod.__set__ 'AuthorModal', @AuthorModal = sinon.stub()
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
    benv.teardown()

  it 'renders list of authors', ->
    @rendered.should.containEql 'Halley Johnson'

  it 'opens the modal with an empty author on Add Author', ->
    r.simulate.click r.find @component, 'authors-header__add-author'
    @AuthorModal.args[2][0].isOpen.should.be.true()
    # should.equal @AuthorModal.args[2].author, null

  it 'opens the modal with an author on Edit Author', ->
    r.simulate.click r.find @component, 'authors-list__item-edit'
    @AuthorModal.args[2][0].isOpen.should.be.true()
    @AuthorModal.args[2][0].author.id.should.equal '55356a9deca560a0137bb4a7'
    @AuthorModal.args[2][0].author.name.should.equal 'Halley Johnson'
    @AuthorModal.args[2][0].author.bio.should.equal 'Writer based in NYC'
    @AuthorModal.args[2][0].author.twitter_handle.should.equal 'kanaabe'
    @AuthorModal.args[2][0].author.image_url.should.equal 'https://artsy-media.net/halley.jpg'
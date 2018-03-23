_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
fixtures = require '../../../../../../test/helpers/fixtures'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-dom/test-utils'
ReactDOMServer = require 'react-dom/server'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'AuthorsView', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      sinon.stub Backbone, 'sync'
      { AuthorsView } = mod = benv.requireWithJadeify(
        resolve(__dirname, '../../../client/authors/index')
        []
      )
      mod.__set__ 'AuthorModal', @AuthorModal = sinon.stub()
      mod.__set__ 'request', {
        post: sinon.stub().returns({
          set: sinon.stub().returns({
            send: sinon.stub().returns({
              end: @request = sinon.stub()
            })
          })
        })
      }
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

  it 'renders more authors on infinite scroll', ->
    authors = [{
      name: 'Kana',
      id: '123'
    }]
    @request.yields(null, body: data: authors: authors)
    @component.fetchFeed()
    @component.state.authors.length.should.equal 2

  it 'returns early and does not add authors if there are no more to show', ->
    @request.yields(new Error())
    @component.fetchFeed()
    @component.state.authors.length.should.equal 1

  it 'opens the modal with an empty author on Add Author', ->
    r.simulate.click r.find @component, 'authors-header__add-author'
    @AuthorModal.args[2][0].isOpen.should.be.true()
    (@AuthorModal.args[2][0].author is null).should.be.true()

  it 'opens the modal with an author on Edit Author', ->
    r.simulate.click r.find @component, 'authors-list__item-edit'
    @AuthorModal.args[2][0].isOpen.should.be.true()
    @AuthorModal.args[2][0].author.id.should.equal '55356a9deca560a0137bb4a7'
    @AuthorModal.args[2][0].author.name.should.equal 'Halley Johnson'
    @AuthorModal.args[2][0].author.bio.should.equal 'Writer based in NYC'
    @AuthorModal.args[2][0].author.twitter_handle.should.equal 'kanaabe'
    @AuthorModal.args[2][0].author.image_url.should.equal 'https://artsy-media.net/halley.jpg'

  it 'closes the modal', ->
    @component.closeModal()
    @component.state.isModalOpen.should.be.false()

  it 'saves an author', ->
    @component.saveAuthor(id: '123456', name: 'Kana Abe')
    Backbone.sync.args[0][2].success()
    @component.state.authors.length.should.equal 2
    @component.state.authors[0].name.should.equal 'Kana Abe'

  it 'displays a save error', ->
    @component.saveAuthor(id: '123456', name: 123)
    Backbone.sync.args[0][2].error()
    @component.state.errorMessage.should.equal 'There has been an error. Please contact support.'

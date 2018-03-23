_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
fixtures = require '../../../../../../test/helpers/fixtures'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-dom/test-utils'
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
        ['icons']
      )
      AuthorModal.__set__ 'AuthorImage', @AuthorImage = sinon.stub()
      props =
        author: fixtures().authors
        isOpen: true
        onSave: @onSave = sinon.stub()
        onClose: @onClose = sinon.stub()
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
    @rendered.should.containEql 'Edit Halley Johnson'
    @rendered.should.containEql 'value="Halley Johnson"'
    @rendered.should.containEql 'value="kanaabe"'
    @rendered.should.containEql 'Writer based in NYC'

  it 'updates twitter_handle state on input changes', ->
    input = r.find @component, 'author-edit__twitter'
    input.value = 'artsyeditorial'
    r.simulate.change input
    @component.state.author.twitter_handle.should.equal 'artsyeditorial'

  it 'updates name state on input changes', ->
    input = r.find @component, 'author-edit__name'
    input.value = 'Owen Dodd'
    r.simulate.change input
    @component.state.author.name.should.equal 'Owen Dodd'

  it 'updates bio state on input changes', ->
    input = r.find @component, 'author-edit__bio'
    input.value = 'This is a new bio.'
    r.simulate.change input
    @component.state.author.bio.should.equal 'This is a new bio.'
    @component.state.remainingChars.should.equal 182

  it 'updates image on change', ->
    @component.onImageChange 'https://artsy.net/new-image.jpg'
    @component.state.author.image_url.should.equal 'https://artsy.net/new-image.jpg'

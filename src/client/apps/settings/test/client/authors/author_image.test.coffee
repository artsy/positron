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

describe 'AuthorImage', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      AuthorImage = benv.requireWithJadeify(
        resolve(__dirname, '../../../client/authors/author_image')
        ['icons']
      )
      AuthorImage.__set__ 'AuthorImage', @AuthorImage = sinon.stub()
      AuthorImage.__set__ 'gemup', @gemup = sinon.stub()
      props =
        src: 'https://artsy.net/image.jpg'
        onChange: @onChange = sinon.stub()
      @rendered = ReactDOMServer.renderToString(
        React.createElement(AuthorImage, props)
      )
      @component = ReactDOM.render(
        React.createElement(AuthorImage, props),
        (@$el = $ "<div></div>")[0],
        =>
      )
      done()

  afterEach ->
    benv.teardown()

  it 'renders image src', ->
    @rendered.should.containEql '?resize_to=fill&amp;src=https%3A%2F%2Fartsy.net%2Fimage.jpg&amp;width=80&amp;height=80&amp;quality=95'

  it 'uploads image', ->
    @component.upload target: files: [size: 400000, type: 'image/jpg']
    @gemup.args[0][1].done('http://gemini-uploaded/img.jpg')
    @component.state.src.should.equal 'http://gemini-uploaded/img.jpg'
    @onChange.args[0][0].should.equal 'http://gemini-uploaded/img.jpg'

  it 'displays an error if image is too large', ->
    @component.upload target: files: [size: 6000000]
    @component.state.error.should.be.true()
    @component.state.errorType.should.equal 'size'

  it 'displays an error if image is not an accepted type', ->
    @component.upload target: files: [size: 400000, type: 'gif']
    @component.state.error.should.be.true()
    @component.state.errorType.should.equal 'type'

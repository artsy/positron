benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
fixtures = require '../../../../test/helpers/fixtures'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-dom/test-utils'
ReactDOMServer = require 'react-dom/server'
r =
  findAll: ReactTestUtils.scryRenderedDOMComponentsWithClass
  simulate: ReactTestUtils.Simulate

describe 'TagList', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      TagList = benv.requireWithJadeify(
        resolve(__dirname, '../index')
        []
      )
      props = {
        tags: [
          fixtures().tags
          { id: '123', name: 'Berlin', public: true }
          { id: '456', name: 'China', public: true }
        ]
        deleteTag: sinon.stub()
      }
      @rendered = ReactDOMServer.renderToString(
        React.createElement(TagList, props)
      )
      @component = ReactDOM.render(
        React.createElement(TagList, props),
        (@$el = $ "<div></div>")[0],
        =>
      )
      done()

  afterEach ->
    benv.teardown()

  it 'renders a list of tags', ->
    @rendered.should.containEql 'Berlin'
    @rendered.should.containEql 'China'
    @rendered.should.containEql 'Show Reviews'
    @rendered.should.containEql 'remove-button'

  it 'passes the tag info to deleteTag when deleted', ->
    r.simulate.click(r.findAll(@component, 'remove-button')[0])
    @component.props.deleteTag.args[0][0].name.should.equal 'Show Reviews'
    @component.props.deleteTag.args[0][0].public.should.be.true()

describe 'Empty TagList', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      TagList = benv.requireWithJadeify(
        resolve(__dirname, '../index')
        []
      )
      props = {
        tags: []
        deleteTag: sinon.stub()
      }
      @rendered = ReactDOMServer.renderToString(
        React.createElement(TagList, props)
      )
      done()

  afterEach ->
    benv.teardown()

  it 'renders a message when no results are found', ->
    @rendered.should.containEql 'No Results Found'

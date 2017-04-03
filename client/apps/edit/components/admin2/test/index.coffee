benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
fixtures = require '../../../../../../test/helpers/fixtures.coffee'
Article = require '../../../../../models/article.coffee'
Backbone = require 'backbone'

r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'AdminSections', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      Backbone.$ = $
      $.onInfiniteScroll = sinon.stub()
      AdminSections = benv.require resolve __dirname, '../index'
      printTitle = benv.requireWithJadeify(
        resolve(__dirname, '../../../../../components/dropdown_section/dropdown_header'), ['icons']
      )
      AdminSections.__set__ 'printTitle', React.createFactory printTitle
      AdminSections.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
        USER: access_token: ''
      }
      AdminSections.__set__ 'Article', sinon.stub()
      AdminSections.__set__ 'Featuring', sinon.stub()
      @channel = {id: '123'}
      @channel.hasFeature = sinon.stub().returns false
      @article = new Article
      @article.attributes = fixtures().articles
      props = {
        article: @article
        channel: @channel
        }
      @component = ReactDOM.render React.createElement(AdminSections, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          @component.props.article.save = sinon.stub()
          done()

  afterEach ->
    benv.teardown()

  it 'Adds a section to activeSections on click', ->
    r.simulate.click r.find @component, 'featuring'
    $(ReactDOM.findDOMNode(@component)).find('.edit-admin--featuring').hasClass('active').should.eql true
    @component.state.activeSections.should.eql ['article', 'section-tags', 'featuring']

  it 'Removes a section from activeSections on click', ->
    r.simulate.click r.find @component, 'section-tags'
    $(ReactDOM.findDOMNode(@component)).find('.edit-admin--section-tags').hasClass('active').should.eql false
    @component.state.activeSections.should.eql ['article']

  it '#onChange updates the article attributes', ->
    @component.onChange('tier', 2)
    @component.props.article.get('tier').should.eql 2
    @component.props.article.save.callCount.should.eql 0

  it '#onChange saves the article if unpublished', ->
    @component.props.article.set('published', false)
    @component.onChange('tier', 2)
    @component.props.article.save.callCount.should.eql 1

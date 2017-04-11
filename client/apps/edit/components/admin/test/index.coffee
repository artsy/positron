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
      AdminSections = benv.require resolve __dirname, '../index'
      printTitle = benv.requireWithJadeify(
        resolve(__dirname, '../components/dropdown_header'), ['icons']
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

  it '#componentWillMount fetches featured and mentioned artists/artworks', ->
    @component.props.article.fetchFeatured = sinon.stub()
    @component.props.article.fetchMentioned = sinon.stub()
    @component.componentWillMount()
    @component.props.article.fetchFeatured.called.should.be.ok
    @component.props.article.fetchMentioned.called.should.be.ok

  it 'Adds a section to activeSections on click', ->
    r.simulate.click r.find @component, 'featuring'
    $(ReactDOM.findDOMNode(@component)).find('.edit-admin--featuring').hasClass('active').should.eql true
    @component.state.activeSections.should.eql ['article', 'verticals-tags', 'featuring']

  it 'Removes a section from activeSections on click', ->
    r.simulate.click r.find @component, 'verticals-tags'
    $(ReactDOM.findDOMNode(@component)).find('.edit-admin--verticals-tags').hasClass('active').should.eql false
    @component.state.activeSections.should.eql ['article']

  it '#getActiveSection returns active class if section is active', ->
    @component.getActiveSection('article').should.eql ' active'
    @component.getActiveSection('featuring').should.eql ''

  it '#isActiveSection returns true if section is active', ->
    @component.isActiveSection('article').should.eql true
    @component.isActiveSection('featuring').should.eql false

  it '#onChange updates the article attributes', ->
    @component.onChange('tier', 2)
    @component.props.article.get('tier').should.eql 2

  it 'If unpublished, #onChange does not save and shows indicator', ->
    @component.onChange('tier', 2)
    @component.props.article.save.callCount.should.eql 0
    # is there a way to show jquery changes outside the component?

  it '#onChange saves the article if unpublished', ->
    @component.props.article.set('published', false)
    @component.onChange('tier', 2)
    @component.props.article.save.callCount.should.eql 1

benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
fixtures = require '../../../../../../test/helpers/fixtures.coffee'
Article = require '../../../../../models/article.coffee'
Backbone = require 'backbone'
r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  simulate: ReactTestUtils.Simulate

describe 'AdminVerticalsTags', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      @AdminVerticalsTags = benv.require resolve __dirname, '../verticals_tags/index.coffee'
      @AdminVerticalsTags.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
        USER: access_token: ''
      }
      @article = new Article
      @article.attributes = fixtures().articles
      @article.set 'tags', ['features', 'emerging artists', 'awi', 'asp', 'commissioned photography', 'product boost']
      @channel = {id: '123'}
      props = {
        article: @article
        onChange: sinon.stub()
        channel: @channel
        }
      @component = ReactDOM.render React.createElement(@AdminVerticalsTags, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          done()

  afterEach ->
    benv.teardown()

  describe 'Tags', ->

    it 'Renders a text input for tags', ->
      $(ReactDOM.findDOMNode(@component)).find('input').prop('placeholder').should.eql 'Start typing tags...'

    it 'Pre-populates the input with article tags', ->
      $(ReactDOM.findDOMNode(@component)).find('input').val().should.eql 'features, emerging artists, awi, asp, commissioned photography, product boost'

    it 'does not render tags when tags do not exist', ->
      @article.unset 'tags'
      props = {
        article: @article
        onChange: sinon.stub()
        channel: @channel
        }
      rendered = ReactDOMServer.renderToString React.createElement(@AdminVerticalsTags, props)
      rendered.should.containEql 'value=""'

  describe '#onChange', ->

    it 'Calls onChange with user input', ->
      input = r.find(@component, 'bordered-input')[0]
      input.value = 'new, tags'
      r.simulate.change input
      @component.props.onChange.args[0][1].should.eql [ 'new', 'tags' ]

    it 'Strips spaces outsite terms, not between terms', ->
      input = r.find(@component, 'bordered-input')[0]
      input.value = '   a new   , these   tags    '
      r.simulate.change input
      @component.props.onChange.args[0][1].should.eql [ 'a new', 'these tags' ]

    it 'Does not save empty items', ->
      input = r.find(@component, 'bordered-input')[0]
      input.value = ' , new, tags, , , '
      r.simulate.change input
      @component.props.onChange.args[0][1].should.eql [ 'new', 'tags' ]

  describe 'Verticals', ->

    xit 'Renders fields for Vertical and SubVertical', ->
      $(ReactDOM.findDOMNode(@component)).find('.fields-left .field-group').first().html().should.containEql 'Editorial Vertical'
      $(ReactDOM.findDOMNode(@component)).find('.field-group').first().find('button').length.should.eql 4
      $(ReactDOM.findDOMNode(@component)).find('.fields-left .field-group').last().html().should.containEql 'Editorial SubVertical'
      $(ReactDOM.findDOMNode(@component)).find('.fields-left .field-group').last().find('button').text().should.eql 'Please select a vertical first'


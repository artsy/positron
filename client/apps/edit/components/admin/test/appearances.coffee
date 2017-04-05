benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
fixtures = require '../../../../../../test/helpers/fixtures.coffee'
Article = require '../../../../../models/article.coffee'
Backbone = require 'backbone'

describe 'AdminAppearances', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      Backbone.$ = $
      AdminAppearances = benv.require resolve __dirname, '../appearances/index.coffee'
      AdminAppearances.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
        USER: access_token: ''
      }
      AdminAppearances.__set__ 'AutocompleteSelect', @AutocompleteSelect = sinon.stub().returns({setState: setState = sinon.stub()})
      AdminAppearances.__set__ 'AutocompleteList', @AutocompleteList = sinon.stub()
      @article = new Article
      @article.attributes = fixtures().articles
      @channel = {id: '123'}
      @channel.hasAssociation = sinon.stub().returns true
      props = {
        article: @article
        onChange: sinon.stub()
        channel: @channel
        }
      @component = ReactDOM.render React.createElement(AdminAppearances, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          done()

  afterEach ->
    benv.teardown()

  describe 'AdminAppearances', ->

    it 'Renders the fields', ->
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Fair Programming'
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Artsy at the Fair'
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'About the Fair'
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Extended Artist Biography'

    it 'Sets up autocompletes', ->
      @AutocompleteSelect.callCount.should.eql 1
      @AutocompleteList.callCount.should.eql 3

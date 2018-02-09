benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-dom/test-utils'
fixtures = require '../../../../../../test/helpers/fixtures.coffee'
Article = require '../../../../../models/article.coffee'
Backbone = require 'backbone'

describe 'AdminAppearances', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        Bloodhound: (Bloodhound = sinon.stub()).returns(
          initialize: ->
          ttAdapter: ->
        )
      $.fn.typeahead = sinon.stub()
      window.jQuery = $
      window.matchMedia = sinon.stub().returns({
        matches: sinon.stub()
      })
      Backbone.$ = $
      AdminAppearances = benv.require resolve __dirname, '../appearances/index.coffee'
      AdminAppearances.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
        USER: access_token: ''
      }
      AutocompleteSelect = benv.require resolve __dirname, '../../../../../components/autocomplete_select/index.coffee'
      AutocompleteList = benv.require resolve __dirname, '../../../../../components/autocomplete_list/index.coffee'
      AdminAppearances.__set__ 'AutocompleteSelect', React.createFactory AutocompleteSelect
      AdminAppearances.__set__ 'AutocompleteList', React.createFactory AutocompleteList
      @article = new Article
      @article.attributes = fixtures().articles
      @channel = {id: '123'}
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
      autocompletes = $(ReactDOM.findDOMNode(@component)).find('.autocomplete-input')
      $(autocompletes[0]).prop('placeholder').should.eql 'Search fairs by name...'
      $(autocompletes[1]).prop('placeholder').should.eql 'Search fairs by name...'
      $(autocompletes[2]).prop('placeholder').should.eql 'Search fairs by name...'
      $(ReactDOM.findDOMNode(@component)).find('.autocomplete-select-input').prop('placeholder').should.eql 'Search artist by name...'

benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
Backbone = require 'backbone'
ReactDOMServer = require 'react-dom/server'
ReactTestUtils = require 'react-addons-test-utils'
r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  simulate: ReactTestUtils.Simulate
fixtures = require '../../../../../../test/helpers/fixtures.coffee'
Article = require '../../../../../models/article.coffee'
Vertical = require '../../../../../models/vertical.coffee'
Verticals = require '../../../../../collections/verticals.coffee'

describe 'AdminVerticalsTags', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        Bloodhound: (Bloodhound = sinon.stub()).returns(
          initialize: ->
          ttAdapter: ->
        )
        _: benv.require 'underscore'
      window.jQuery = $
      $.fn.typeahead = sinon.stub()
      @AdminVerticalsTags = benv.require resolve __dirname, '../verticals_tags/index2.coffee'
      @AdminVerticalsTags.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
        USER: access_token: ''
      }
      AutocompleteList = benv.require resolve __dirname, '../../../../../components/autocomplete_list/index.coffee'
      AutocompleteList.__set__ 'request', get: sinon.stub().returns
        set: sinon.stub().returns
          end: sinon.stub().yields(null, body: {results: [{ id: '123', name: 'Artists'}]})
      @AdminVerticalsTags.__set__ 'AutocompleteList', React.createFactory AutocompleteList
      @article = new Article
      @Verticals = new Verticals([
        { id: '1', name: 'Art'}
        { id: '2', name: 'Art Market'}
        { id: '3', name: 'Creativity'}
        { id: '4', name: 'Culture'}
      ])
      _.first = sinon.stub().returns new Vertical({ id: '1', name: 'Art'})
      @article.attributes = fixtures().articles
      @article.set 'tags', ['Artists']
      @article.set 'tracking_tags', []
      @article.set 'vertical', {}
      props = {
        article: @article
        onChange: sinon.stub()
      }
      sinon.stub Backbone, 'sync'
      @component = ReactDOM.render React.createElement(@AdminVerticalsTags, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          @component.setState verticals: @Verticals
          done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown()

  describe 'Tags', ->

    it 'Renders text inputs for tags', ->
      $(ReactDOM.findDOMNode(@component)).find('.autocomplete-container--inline').length.should.eql 2
      $(ReactDOM.findDOMNode(@component)).find('input').first().prop('placeholder').should.eql ''
      $(ReactDOM.findDOMNode(@component)).find('input').last().prop('placeholder').should.eql 'Start typing a tracking tag...'

    it 'Pre-populates the input with article tags', ->
      $(ReactDOM.findDOMNode(@component)).find('.autocomplete-container').first().html().should.containEql '<span class="selected">Artists</span>'

    it 'does not render tags when empty', ->
      @article.unset 'tags'
      rendered = ReactDOMServer.renderToString React.createElement(@AdminVerticalsTags, { article: @article })
      rendered.should.containEql 'placeholder="Start typing a topic tag..."'

  describe 'Verticals', ->

    it 'Renders buttons for Verticals', ->
      $(ReactDOM.findDOMNode(@component)).find('.fields-left .field-group').first().html().should.containEql 'Editorial Vertical'
      $(ReactDOM.findDOMNode(@component)).find('.field-group').first().find('button').length.should.eql 4
      $(ReactDOM.findDOMNode(@component)).find('.field-group').first().find('button.avant-garde-button-black').length.should.eql 0

    it 'Can render a saved vertical', ->
      @component.setState vertical: { id: '1', name: 'Art'}
      $(ReactDOM.findDOMNode(@component)).find('.field-group').first().find('button.avant-garde-button-black').length.should.eql 1

    it 'Updates the vertical on click', ->
      @component.state.vertical.should.eql {}
      r.simulate.click r.find(@component, 'avant-garde-button')[0]
      @component.state.vertical.should.eql { name: 'Art', id: '1' }
      @component.props.onChange.args[0][0].should.eql 'vertical'
      @component.props.onChange.args[0][1].should.eql { name: 'Art', id: '1' }

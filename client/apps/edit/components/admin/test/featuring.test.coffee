benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-dom/test-utils'
fixtures = require '../../../../../../test/helpers/fixtures.coffee'
Article = require '../../../../../models/article.coffee'
Backbone = require 'backbone'
_ = require 'underscore'
{ fabricate } = require 'antigravity'
r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  findTag: ReactTestUtils.scryRenderedDOMComponentsWithTag
  simulate: ReactTestUtils.Simulate

describe 'AdminFeaturing', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        Bloodhound: (@Bloodhound = sinon.stub()).returns(
          initialize: ->
          ttAdapter: ->
        )
      window.matchMedia = sinon.stub().returns({
        matches: sinon.stub()
      })
      $.fn.typeahead = sinon.stub()
      AdminFeaturing = benv.require resolve __dirname, '../featuring/index.coffee'
      @channel = {id: '123', type: 'editorial'}
      AdminFeaturing.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: @channel
        USER: access_token: ''
      }
      AdminFeaturing.__set__ 'AutocompleteList', @AutocompleteList = benv.require(
        resolve __dirname, '../../../../../components/autocomplete_list/index.coffee'
      )
      AutocompleteList = benv.require resolve __dirname, '../../../../../components/autocomplete_list/index.coffee'
      AdminFeaturing.__set__ 'AutocompleteList', React.createFactory AutocompleteList
      @article = new Article
      @article.attributes = fixtures().articles
      @article.mentionedArtists.reset(
        [
          _.extend(fabricate 'artist', id: 'charles-ray', name: 'Charles Ray', _id: '456')
          _.extend(fabricate 'artist', id: 'andy-cahill', name: 'Andy Cahill', _id: '888')
          _.extend(fabricate 'artist', id: 'jutta-koether', name: 'Jutta Koether', _id: '666')
        ])
      @article.featuredPrimaryArtists.reset(
        [
          _.extend(fabricate 'artist', id: 'rachel-rose', name: 'Rachel Rose', _id: '789')
          _.extend(fabricate 'artist', id: 'andy-cahill', name: 'Andy Cahill', _id: '123')
        ])
      props = {
        article: @article
        channel: @channel
        onChange: sinon.stub()
        }
      @component = ReactDOM.render React.createElement(AdminFeaturing, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          done()

  afterEach ->
    benv.teardown()

  describe 'AdminFeaturing', ->

    it 'Renders the autocomplete fields', ->
      autocompletes = $(ReactDOM.findDOMNode(@component)).find('.autocomplete-input').toArray()
      $(autocompletes[0]).prop('placeholder').should.eql 'Search partners by name...'
      $(autocompletes[1]).prop('placeholder').should.eql 'Search fairs by name...'
      $(autocompletes[2]).prop('placeholder').should.eql 'Search shows by name...'
      $(autocompletes[3]).prop('placeholder').should.eql 'Search auctions by name...'

    it 'Does not render autocomplete fields for team channels', ->
      @component.props.channel.type = 'team'
      @component.forceUpdate()
      autocompletes = $(ReactDOM.findDOMNode(@component)).find('.autocomplete-input').toArray()
      autocompletes.length.should.eql 0

    it 'Renders the featured and mentioned fields', ->
      $(ReactDOM.findDOMNode(@component)).find('form input').first().attr('placeholder').should.eql 'Add an artist by slug or url...'
      $(ReactDOM.findDOMNode(@component)).find('form input').last().attr('placeholder').should.eql 'Add an artwork by slug or url...'
      $(ReactDOM.findDOMNode(@component)).find('.feature').length.should.eql 2
      $(ReactDOM.findDOMNode(@component)).find('.feature-mention').length.should.eql 4

    it '#onInputChange', ->
      @component.props.article.featuredPrimaryArtists.getOrFetchIds = sinon.stub()
      input = r.find(@component, 'bordered-input')[4]
      input.value = 'http://artsy.net/artist/dena-yago'
      r.simulate.submit r.findTag(@component, 'form')[0]
      @component.props.article.featuredPrimaryArtists.getOrFetchIds.args[0][0][0].should.eql 'dena-yago'

    it '#onChangeFeatured creates an array of featured ids and calls props.onChange', ->
      @component.onChangeFeatured 'PrimaryArtists'
      @component.props.onChange.args[0][0].should.eql 'primary_featured_artist_ids'
      @component.props.onChange.args[0][1].should.eql [ '123', '789' ]

    it '#featureMentioned adds a mentioned item to the featured list', ->
      r.simulate.click r.find(@component, 'mention')[0]
      $(ReactDOM.findDOMNode(@component)).find('.feature').length.should.eql 3
      @component.props.onChange.args[0][1].should.eql [ '123', '789', '456' ]

    it '#unfeature removes an item from the featured list', ->
      r.simulate.click r.find(@component, 'feature')[0]
      $(ReactDOM.findDOMNode(@component)).find('.feature').length.should.eql 1
      @component.props.onChange.args[0][1].should.eql [ '789' ]

    it '#sortFeatured returns items in alphabetical order by name', ->
     $(ReactDOM.findDOMNode(@component)).find('.feature').text().should.eql 'Andy CahillRachel Rose'
     $(ReactDOM.findDOMNode(@component)).find('.mention').text().should.eql 'Charles RayJutta Koether'

    it '#getFeatured renders all items in the featured list', ->
      getFeatured = @component.getFeatured 'PrimaryArtists'
      getFeatured.length.should.eql 2
      getFeatured[0].props['data-id'].should.eql 'andy-cahill'
      getFeatured[1].props['data-id'].should.eql 'rachel-rose'

    it '#getMentioned renders mentioned items unless they are featured', ->
      getMentioned = @component.getMentioned 'Artists', 'PrimaryArtists'
      getMentioned.length.should.eql 3
      getMentioned[0].should.eql false
      getMentioned[1].props['data-id'].should.eql 'charles-ray'
      getMentioned[2].props['data-id'].should.eql 'jutta-koether'

    it '#showSelectAllMentioned shows a checkbox if mentioned list includes unfeatured items', ->
      $(ReactDOM.findDOMNode(@component)).find('.flat-checkbox').length.should.eql 1

    it '#selectAllMentioned adds all mentioned items to the featured list', ->
      r.simulate.click r.find(@component, 'flat-checkbox')[0]
      @component.props.onChange.args[0][0].should.eql 'primary_featured_artist_ids'
      @component.props.onChange.args[0][1].length.should.eql 4
      $(ReactDOM.findDOMNode(@component)).find('.feature').length.should.eql 4
      $(ReactDOM.findDOMNode(@component)).find('.mention').length.should.eql 0
      $(ReactDOM.findDOMNode(@component)).find('.flat-checkbox').length.should.eql 0

Backbone = require 'backbone'
benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
{ fabricate } = require 'antigravity'
User = require '../../../models/user.coffee'

describe 'AutocompleteChannels', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        Bloodhound: (Bloodhound = sinon.stub()).returns(
          initialize: ->
          ttAdapter: ->
        )
      window.jQuery = $
      require 'typeahead.js'
      Backbone.$ = $
      Bloodhound.tokenizers = { obj: { whitespace: sinon.stub() } }
      sinon.stub Backbone, 'sync'
      @AutocompleteChannels = benv.require resolve __dirname, '../index'
      @AutocompleteChannels.__set__ 'Modal', sinon.stub().returns {m: ''}
      @AutocompleteChannels.__set__ 'sd', { USER: { type: 'Admin', id: '123', name: 'Kana'} }
      sinon.stub @AutocompleteChannels.prototype, 'setupTypeahead'
      sinon.stub(User.prototype, 'fetchPartners').yields [fabricate 'partner']
      done()

  afterEach (done) ->
    Backbone.sync.restore()
    @AutocompleteChannels.prototype.setupTypeahead.restore()
    User.prototype.fetchPartners.restore()
    benv.teardown()
    done()

  describe '#initialize', ->

    it 'sets the user', ->
      view = new @AutocompleteChannels
      view.user.get('name').should.equal 'Kana'

    xit 'sets Bloodhound args for channel source', ->
      view = new @AutocompleteChannels
      view.channels.remote.url.should.containEql '/channels?user_id=123'

    xit 'sets Bloodhound args for partner source as an Admin', ->
      view = new @AutocompleteChannels
      view.adminPartners.remote.url.should.containEql '/api/v1/match/partners?term=%QUERY'

    xit 'sets Bloodhound args for partner source as a partner', ->
      @AutocompleteChannels.__set__ 'sd', { USER: { type: 'User', id: '123', name: 'Kana'} }
      view = new @AutocompleteChannels
      view.partners.local.length.should.equal 1
      view.partners.local[0].value.should.equal 'Gagosian Gallery'

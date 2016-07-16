Backbone = require 'backbone'
benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'


describe 'AutocompleteChannels', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        sd: { USER: type: 'Admin'}
        window: {}
      require 'typeahead.js'
      Backbone.$ = $
      sinon.stub Backbone, 'sync'
      @AutocompleteChannels = benv.require resolve __dirname, '../index'
      @AutocompleteChannels.__set__ 'Modal', sinon.stub().returns {m: ''}
      done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown()

  describe '#initialize', ->

    # it 'sets the user', ->
    #   new @AutocompleteChannels
    #   console.log @AutocompleteChannels.user

    # it 'fetches partners for local querying', ->
    #   @AutocompleteChannels.initialize()

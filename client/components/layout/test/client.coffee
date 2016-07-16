Backbone = require 'backbone'
benv = require 'benv'
sinon = require 'sinon'
fixtures = require '../../../../test/helpers/fixtures'
rewire = require 'rewire'

describe '#init', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        _: require('underscore')
        $: require('jquery')
        window: {}
        jQuery: require('jquery')
      Backbone.$ = $
      @client = rewire '../client.coffee'
      @client.__set__ 'AutocompleteChannels', sinon.stub()
      done()

  afterEach: ->
    benv.teardown()

  # it 'initializes AutocompleteChannels view when clicking into "Switch Channels"', ->
  #   @client.init()
  #   $('#layout-sidebar-switch-channel').click()
  #   @autocomplete.calledOnce().should.be.true()

  # it 'ensures a fresh user', ->

_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Channel = require '../../../models/channel'
Backbone = require 'backbone'
moment = require 'moment'
should = require 'should'
fixtures = require '../../../../test/helpers/fixtures'
{ fabricate } = require 'antigravity'
{ resolve } = require 'path'

describe 'EditChannel', ->

  beforeEach (done) ->
    benv.setup =>
      tmpl = resolve __dirname, '../templates/channel_edit.jade'
      @channel = new Channel fixtures().channels
      benv.render tmpl, _.extend(fixtures().locals,
        channel: @channel
        sd: CURRENT_CHANNEL: @channel
      ), =>
        benv.expose $: benv.require('jquery')
        Backbone.$ = $
        sinon.stub Backbone, 'sync'
        EditChannel = require '../client/channels.coffee'
        EditChannel.__set__ 'AutocompleteSortableList', sinon.stub()
        EditChannel::setupUserAutocomplete = sinon.stub()
        EditChannel::setupPinnedArticlesAutocomplete = sinon.stub()
        EditChannel::setupBackgroundImageForm = sinon.stub()
        @view = new EditChannel el: $('#edit-channel'), channel: @channel
        done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()

  describe '#initialize', ->

    it 'sets up autocomplete and image uploading', ->
      EditChannel.setupUserAutocomplete.called.should.be.true()
_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Channel = require '../../../models/channel'
Backbone = require 'backbone'
moment = require 'moment'
should = require 'should'
fixtures = require '../../../../test/helpers/fixtures'
{ resolve } = require 'path'
rewire = require 'rewire'

describe 'EditChannel', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      Backbone.$ = $
      sinon.stub Backbone, 'sync'
      @channel = new Channel fixtures().channels
      locals = _.extend(fixtures().locals,
        channel: @channel
      )
      locals.sd = _.extend locals.sd, { CURRENT_CHANNEL: @channel }
      tmpl = resolve __dirname, '../templates/channel_edit.jade'
      benv.render tmpl, locals, =>
        { @EditChannel } = mod = rewire '../client/channels.coffee'
        mod.__set__ 'AutocompleteSortableList', sinon.stub()
        @EditChannel::setupUserAutocomplete = sinon.stub()
        @EditChannel::setupPinnedArticlesAutocomplete = sinon.stub()
        @EditChannel::setupBackgroundImageForm = sinon.stub()
        @view = new @EditChannel el: $('body'), channel: @channel
        done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()

  describe '#initialize', ->

    it 'sets up autocomplete and image uploading', ->
      @view.setupUserAutocomplete.called.should.be.true()
      @view.setupPinnedArticlesAutocomplete.called.should.be.true()
      @view.setupBackgroundImageForm.called.should.be.true()

    it 'populates saved channel data', ->
      $('body').html().should.containEql 'A bunch of cool stuff at Artsy'
      $('body').html().should.containEql 'editorial'

  describe '#saveMetadata', ->

    it 'triggers a save when button is clicked', ->
      $('.js--channel-save-metadata').click()
      Backbone.sync.args[0][2].success()
      $('body').html().should.containEql 'Saved'

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
      @channel = _.extend fixtures().channels, type: 'team'
      locals = _.extend(fixtures().locals,
        channel: new Channel @channel
      )
      locals.sd = _.extend locals.sd, { CHANNEL: @channel }
      tmpl = resolve __dirname, '../templates/channels/channel_edit.jade'
      benv.render tmpl, locals, =>
        { @EditChannel } = mod = rewire '../client/channels.coffee'
        mod.__set__ 'AutocompleteSortableList', sinon.stub()
        mod.__set__ 'sd', { CHANNEL: @channel }
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

  describe '#linkArray', ->

    it 'properly formats the array of featured links', ->
      $("input[name='links[0][text]']").val 'Test Link'
      $("input[name='links[0][url]']").val 'url.com'
      arr = @view.linkArray()
      arr[0].text.should.equal 'Test Link'
      arr[0].url.should.equal 'url.com'

  describe '#indexPinnedArticles', ->

    it 'properly formats the pinned articles array based on items', ->
      items = [
        { id: '12345' }
        { id: '67890' }
      ]
      index = @view.indexPinnedArticles items
      index[0].id.should.equal '12345'
      index[0].index.should.equal 0
      index[1].id.should.equal '67890'
      index[1].index.should.equal 1

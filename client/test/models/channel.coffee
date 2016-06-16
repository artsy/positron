_ = require 'underscore'
Backbone = require 'backbone'
Channel = require '../../models/channel.coffee'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'

describe "Channel", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @channel = new Channel fixtures().articles

  afterEach ->
    Backbone.sync.restore()

  describe '#getFeatures', ->

    it 'returns features for editorial type', ->
      @channel.set
        name: 'Editorial'
        type: 'editorial'
      @channel.getFeatures().features[0].should.equal 'header'
      @channel.getFeatures().sections[0].should.equal 'text'
      @channel.getFeatures().sections.length.should.equal 8
      @channel.getFeatures().associations.length.should.equal 6

    it 'returns features for team type', ->
      @channel.set
        name: 'Life At Artsy'
        type: 'team'
      @channel.getFeatures().features.length.should.equal 0
      @channel.getFeatures().sections.length.should.equal 7
      @channel.getFeatures().associations.length.should.equal 0

    it 'returns features for support type', ->
      @channel.set
        name: 'Auctions'
        type: 'support'
      @channel.getFeatures().features.length.should.equal 0
      @channel.getFeatures().sections.length.should.equal 5
      @channel.getFeatures().associations.length.should.equal 6
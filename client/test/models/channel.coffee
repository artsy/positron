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

  describe '#hasFeature', ->

    it 'returns features for editorial type', ->
      @channel.set
        name: 'Editorial'
        type: 'editorial'
      @channel.hasFeature('header').should.be.true()
      @channel.hasFeature('text').should.be.true()
      @channel.hasFeature('superArticle').should.be.true()
      @channel.hasFeature('artworks').should.be.true()
      @channel.hasFeature('images').should.be.true()
      @channel.hasFeature('image_set').should.be.true()
      @channel.hasFeature('video').should.be.true()
      @channel.hasFeature('embed').should.be.true()
      @channel.hasFeature('callout').should.be.true()
      @channel.hasFeature('toc').should.be.true()

    it 'returns features for team type', ->
      @channel.set
        name: 'Life At Artsy'
        type: 'team'
      @channel.hasFeature('header').should.be.false()
      @channel.hasFeature('text').should.be.true()
      @channel.hasFeature('superArticle').should.be.false()
      @channel.hasFeature('artworks').should.be.true()
      @channel.hasFeature('images').should.be.true()
      @channel.hasFeature('image_set').should.be.true()
      @channel.hasFeature('video').should.be.true()
      @channel.hasFeature('embed').should.be.true()
      @channel.hasFeature('callout').should.be.true()
      @channel.hasFeature('toc').should.be.false()

    it 'returns features for support type', ->
      @channel.set
        name: 'Auctions'
        type: 'support'
      @channel.hasFeature('header').should.be.false()
      @channel.hasFeature('text').should.be.true()
      @channel.hasFeature('superArticle').should.be.false()
      @channel.hasFeature('artworks').should.be.true()
      @channel.hasFeature('images').should.be.true()
      @channel.hasFeature('image_set').should.be.false()
      @channel.hasFeature('video').should.be.true()
      @channel.hasFeature('embed').should.be.false()
      @channel.hasFeature('callout').should.be.true()
      @channel.hasFeature('toc').should.be.false()

    it 'returns features for partner type', ->
      @channel.set
        name: 'Gagosian'
        type: 'partner'
      @channel.hasFeature('header').should.be.false()
      @channel.hasFeature('text').should.be.true()
      @channel.hasFeature('superArticle').should.be.false()
      @channel.hasFeature('artworks').should.be.true()
      @channel.hasFeature('images').should.be.true()
      @channel.hasFeature('image_set').should.be.false()
      @channel.hasFeature('video').should.be.true()
      @channel.hasFeature('embed').should.be.false()
      @channel.hasFeature('callout').should.be.false()
      @channel.hasFeature('toc').should.be.false()

  describe '#hasAssociation', ->

    it 'returns associations for editorial type', ->
      @channel.set
        name: 'Editorial'
        type: 'editorial'
      @channel.hasAssociation('artworks').should.be.true()
      @channel.hasAssociation('artists').should.be.true()
      @channel.hasAssociation('shows').should.be.true()
      @channel.hasAssociation('fairs').should.be.true()
      @channel.hasAssociation('partners').should.be.true()
      @channel.hasAssociation('auctions').should.be.true()

    it 'returns associations for team type', ->
      @channel.set
        name: 'Life At Artsy'
        type: 'team'
      @channel.hasAssociation('artworks').should.be.false()
      @channel.hasAssociation('artists').should.be.false()
      @channel.hasAssociation('shows').should.be.false()
      @channel.hasAssociation('fairs').should.be.false()
      @channel.hasAssociation('partners').should.be.false()
      @channel.hasAssociation('auctions').should.be.false()

    it 'returns associations for support type', ->
      @channel.set
        name: 'Auctions'
        type: 'support'
      @channel.hasAssociation('artworks').should.be.true()
      @channel.hasAssociation('artists').should.be.true()
      @channel.hasAssociation('shows').should.be.true()
      @channel.hasAssociation('fairs').should.be.true()
      @channel.hasAssociation('partners').should.be.true()
      @channel.hasAssociation('auctions').should.be.true()

    it 'returns associations for partner type', ->
      @channel.set
        name: 'Gagosian'
        type: 'partner'
      @channel.hasAssociation('artworks').should.be.false()
      @channel.hasAssociation('artists').should.be.false()
      @channel.hasAssociation('shows').should.be.false()
      @channel.hasAssociation('fairs').should.be.false()
      @channel.hasAssociation('partners').should.be.false()
      @channel.hasAssociation('auctions').should.be.false()

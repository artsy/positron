_ = require 'underscore'
Backbone = require 'backbone'
rewire = require 'rewire'
Channel = rewire '../../models/channel.coffee'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'
request = require 'superagent'
{ fabricate } = require 'antigravity'

describe "Channel", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'

  afterEach ->
    Backbone.sync.restore()

  describe '#hasFeature', ->

    beforeEach ->
      @channel = new Channel fixtures().channels

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

    beforeEach ->
      @channel = new Channel fixtures().channels

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

  describe '#fetchChannelOrPartner' , ->

    it 'returns an error if it cannot find either' , ->
      request.end = (cb) -> cb( null , {} )
      Channel.__set__ 'request', request

      @channel = new Channel fixtures().channels
      @error = false
      @channel.fetchChannelOrPartner
        error: =>
          @error = true
      _.defer ->
        @error.should.be.true()

    it 'returns an error if there is an async error' , ->
      Channel.__set__ 'async',
        parallel: sinon.stub().yields('Async Error', [])

      @channel = new Channel fixtures().channels
      @channel.fetchChannelOrPartner
        error: (err) ->
          err.should.equal 'Async Error'

    it 'fetches a channel' , ->
      Channel.__set__ 'async',
        parallel: sinon.stub().yields(null, [
          {
            ok: true
            body: fixtures().channels
          }
          {}
        ])

      @channel = new Channel fixtures().channels
      @channel.fetchChannelOrPartner
        success: (channel) ->
          channel.get('name').should.equal 'Editorial'
          channel.get('type').should.equal 'editorial'
          channel.get('id').should.equal '5086df098523e60002000018'

    it 'fetches a partner' , ->
      Channel.__set__ 'async',
        parallel: sinon.stub().yields(null, [
          {}
          {
            ok: true
            body: fabricate 'partner'
          }
        ])

      @channel = new Channel fixtures().channels
      @channel.fetchChannelOrPartner
        success: (channel) ->
          channel.get('name').should.equal 'Gagosian Gallery'
          channel.get('type').should.equal 'partner'
          channel.get('id').should.equal '5086df098523e60002000012'

  describe '#denormalized', ->

    it 'returns formatted data for a channel', ->
      @channel = new Channel fixtures().channels
      @channel.denormalized().type.should.equal 'editorial'
      @channel.denormalized().name.should.equal 'Editorial'

    it 'returns formatted data for a partner channel' , ->
      @channel = new Channel fabricate 'partner'
      @channel.denormalized().name.should.equal 'Gagosian Gallery'
      @channel.denormalized().type.should.equal 'partner'

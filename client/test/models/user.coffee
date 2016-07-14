_ = require 'underscore'
Backbone = require 'backbone'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'
rewire = require 'rewire'
request = require 'superagent'
User = rewire '../../models/user'
Article = require '../../models/article'

describe "User", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'

  afterEach ->
    Backbone.sync.restore()

  describe '#isAdmin', ->

    it 'returns true for an Admin user', ->
      @user = new User fixtures().users
      @user.isAdmin().should.be.true()

    it 'returns false for a non-Admin user', ->
      @user = new User _.extend fixtures().users, type: 'User'
      @user.isAdmin().should.be.false()

  describe '#hasChannel', ->

    it 'returns true for a member of a channel', ->
      @user = new User _.extend fixtures().users, { channel_ids: ['1234'] }
      @user.hasChannel('1234').should.be.true()

    it 'returns false for a non-member of a channel', ->
      @user = new User _.extend fixtures().users, { channel_ids: [] }
      @user.hasChannel('1234').should.be.false()

  describe '#hasPartner', ->

    it 'returns true for a user with partner permissions', ->
      @user = new User _.extend fixtures().users, { partner_channel_ids: ['1234'] }
      @user.hasPartner('1234').should.be.true()

    it 'returns true for a user that is an Admin', ->
      @user = new User fixtures().users
      @user.hasPartner('1234').should.be.true()

    it 'returns false for a user that does not have partner permissions', ->
      @user = new User _.extend fixtures().users, { type: 'User', partner_channel_ids: [] }
      @user.hasPartner('1234').should.be.false()

  describe '#hasArticleAccess', ->

    it 'returns true for a member of a channel on a channel article', ->
      @article = new Article fixtures().articles
      @user = new User _.extend fixtures().users, { channel_ids: ['1234'] }
      @user.hasArticleAccess(@article).should.be.true()

    it 'returns true for a member of a partner on a partner article', ->
      @article = new Article _.extend fixtures().articles, { partner_channel_id: '1234' }
      @user = new User _.extend fixtures().users, { partner_channel_ids: ['1234'] }
      @user.hasArticleAccess(@article).should.be.true()

    it 'returns true for a member of an Admin on a partner article', ->
      @article = new Article fixtures().articles
      @user = new User _.extend fixtures().users, { channel_ids: ['1234'] }
      @user.hasArticleAccess(@article).should.be.true()

    it 'returns false for a member of a channel on a partner article', ->
      @article = new Article _.extend fixtures().articles, { partner_channel_id: '1234' }
      @user = new User _.extend fixtures().users, { channel_ids: ['12345'], type: 'User' }
      @user.hasArticleAccess(@article).should.be.false()

    it 'returns false for a member of a partner on a channel article', ->
      @article = new Article _.extend fixtures().articles, { channel_id: '1234' }
      @user = new User _.extend fixtures().users, { partner_channel_ids: ['12345'] }
      @user.hasArticleAccess(@article).should.be.false()

  # describe '#refresh', ->

  #   it 'sends a GET request to the /me/refresh endpoint to manually resave the user', ->
  #     User.__set__ 'request', {
  #       end: (cb) -> cb()
  #     }
  #     @user = new User fixtures().users
  #     @user.refresh()

  # describe '#isOutdated', ->

  #   it 'returns true if the name, email, type, or id has changed', ->


  # describe '#fetchPartners', ->
  #   request.end = (cb) -> cb( null , {} )
  #   User.__set__ 'request', request


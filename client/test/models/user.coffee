_ = require 'underscore'
Backbone = require 'backbone'
User = require '../../models/user'
rewire = require 'rewire'
# request = rewire 'superagent'
async = rewire 'async'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'

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

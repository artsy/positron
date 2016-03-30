_ = require 'underscore'
Backbone = require 'backbone'
rewire = require 'rewire'
User = rewire '../../models/user'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'

describe "User", ->

  beforeEach ->
    User.__set__ 'sd', EDITORIAL_TEAM: 'kana'
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

  describe '#isEditorialTeam', ->

    it 'returns true for an Editorial Team member', ->
      @user = new User _.extend fixtures().users, email: 'kana@artsymail.com'
      @user.isEditorialTeam().should.be.true()

    it 'returns false for a non-Editorial Team member', ->
      @user = new User _.extend fixtures().users, email: 'jack@artsymail.com'
      @user.isEditorialTeam().should.be.false()
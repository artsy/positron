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

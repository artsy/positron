_ = require 'underscore'
{ fixtures } = require '../../../test/helpers/db'
sinon = require 'sinon'
rewire = require 'rewire'
routes = rewire '../routes'
{ ObjectId } = require 'mongojs'

describe 'routes', ->

  beforeEach ->
    @User = routes.__get__ 'User'
    for method in @methods = ['fromAccessToken', 'destroyFromAccessToken']
      sinon.stub @User, method
    @req = { query: {}, body: {}, params: {} }
    @res = { send: sinon.stub(), err: sinon.stub() }
    @next = sinon.stub()

  afterEach ->
    @User[method].restore() for method in @methods

  describe '#deleteMe', ->

    it 'deletes a user', ->
      @req.get = -> 'test-access-token'
      routes.deleteMe @req, @res
      @User.destroyFromAccessToken.args[0][0].should.equal 'test-access-token'
      @User.destroyFromAccessToken.args[0][1] null, u = fixtures().users
      @res.send.args[0][0].name.should.equal u.name

  describe '#set', ->

    it 'fetches and sets a user', ->
      @req.get = -> 'test-access-token'
      routes.set @req, @res, @next
      @User.fromAccessToken.args[0][0].should.equal 'test-access-token'
      @User.fromAccessToken.args[0][1] null, u = fixtures().users
      @req.user.name.should.equal u.name

    it '404s when it cant find a user from the token', ->
      @req.get = -> 'test-access-token'
      routes.set @req, @res, @next
      @User.fromAccessToken.args[0][0].should.equal 'test-access-token'
      @User.fromAccessToken.args[0][1] null, null
      @res.err.called.should.be.ok
      @res.err.args[0][0].should.equal 404

    it 'swaps the `me` param with the current user', ->
      @req.query.author_id = 'me'
      @req.get = -> 'test-access-token'
      routes.set @req, @res, @next
      @User.fromAccessToken.args[0][0].should.equal 'test-access-token'
      u = _.extend fixtures().users, _id: ObjectId('5086df098523e60002000012')
      @User.fromAccessToken.args[0][1] null, u
      @req.query.author_id.should.equal u._id.toString()
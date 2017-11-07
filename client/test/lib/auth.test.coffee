sinon = require 'sinon'
rewire = require 'rewire'
Backbone = require 'backbone'
auth = rewire '../../lib/setup/auth'

describe 'auth middleware', ->

  beforeEach ->
    @req =
      logout: sinon.stub()
    @res =
      redirect: sinon.stub()
    @next = sinon.stub()
    @logout = auth.__get__('logout')
    sinon.stub Backbone, 'sync'

  afterEach ->
    Backbone.sync.restore()

  describe 'logout', ->

    it 'destroys the api & client session', ->
      @req.user = new Backbone.Model
      @logout @req, @res, @next
      @req.logout.called.should.be.ok
      @res.redirect.called.should.be.ok

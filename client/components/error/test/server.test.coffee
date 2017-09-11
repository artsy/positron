sinon = require 'sinon'
rewire = require 'rewire'
app = rewire '../server'

describe 'errorHandler', ->

  beforeEach ->
    @errorHandler = app.__get__ 'errorHandler'
    @err = new Error
    @req = { query: {}, params: {}, get: sinon.stub() }
    @res = {
      render: sinon.stub()
      locals: { sd: {} }
      redirect: sinon.stub()
      send: sinon.stub()
    }
    @next = sinon.stub()

  it 'logsout for 401s', ->
    @err.status = 401
    @errorHandler @err, @req, @res, @next
    @res.redirect.args[0][0].should.equal '/logout'

  it 'logsout for 403s', ->
    @err.status = 403
    @errorHandler @err, @req, @res, @next
    @res.redirect.args[0][0].should.equal '/logout'

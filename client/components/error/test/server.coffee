sinon = require 'sinon'
rewire = require 'rewire'
app = rewire '../server'

describe 'errorHandler', ->

  beforeEach ->
    @errorHandler = app.__get__ 'errorHandler'
    @err = new Error
    @req = { query: {}, params: {} }
    @res = { render: sinon.stub(), locals: { sd: {} }, redirect: sinon.stub() }
    @next = sinon.stub()

  it 'logsout for 401s and 403', ->
    @err.status = 401
    @errorHandler @err, @req, @res, @next
    @res.redirect.args[0][0].should.equal '/logout'
    @err.status = 403
    @errorHandler @err, @req, @res, @next
    @res.redirect.args[1][0].should.equal '/logout'

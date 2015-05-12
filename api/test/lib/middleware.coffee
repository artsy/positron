express = require 'express'
sinon = require 'sinon'
middleware = require '../../lib/middleware'

describe 'middleware', ->

  beforeEach ->
    @req = { get: (->), query: {} }
    @res = {}
    @res.locals =  { sd: {} }
    for method in ['send', 'status']
      @res[method] = sinon.stub()
      @res[method].returns @res
    @next = sinon.stub()

  describe 'helpers res.err', ->

    it 'sends consistent error messages with sensible defaults', ->
      middleware.helpers @req, @res, @next
      @res.err()
      @next.args[1][0].status.should.equal 500
      @next.args[1][0].message.should.equal "Internal Error"

    it 'sends consistent error messages that is customizable', ->
      middleware.helpers @req, @res, @next
      @res.err 403, "Game Over"
      @next.args[1][0].status.should.equal 403
      @next.args[1][0].message.should.equal "Game Over"

  describe 'notFound', ->

    it 'throws a nice 404', ->
      middleware.helpers @req, @res,@next
      middleware.notFound @req, @res,@next
      @next.args[1][0].status.should.equal 404
      @next.args[1][0].message.should.equal "Endpoint does not exist."

  describe 'errorHandler', ->

    it 'throws uncaught exceptions in a consistent error message', ->
      err = new Error
      err.status = 501
      err.stack = "lineno 50"
      err.message = "Game is so over"
      middleware.helpers @req, @res, @next
      middleware.errorHandler err, @req, @res,@next
      @res.status.args[0][0].should.equal 501
      @res.send.args[0][0].status.should.equal 501
      @res.send.args[0][0].message.should.equal "Game is so over"

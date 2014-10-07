express = require 'express'
sinon = require 'sinon'
middleware = require '../../lib/middleware'
Backbone = require 'backbone'

describe 'middleware', ->

  beforeEach ->
    @req = {}
    @res = {}
    @res.locals =  { sd: {} }
    @res.status = sinon.stub()
    @res.status.returns @res
    @res.send = sinon.stub()
    @res.send.returns @res
    @next = sinon.stub()

  describe 'locals', ->

    it 'adds some locals', ->
      @req.url = '/foo/bar/baz'
      middleware.locals @req, @res, @next
      @res.locals.sd.URL.should.equal '/foo/bar/baz'

  describe 'errorHandler', ->

    it 'sets the err status and renders its message', ->
      err = new Error
      err.status = 401
      err.message = "Denied!"
      middleware.errorHandler err, @req, @res, @next
      @res.status.args[0][0].should.equal 401
      @res.send.args[0][0].should.containEql "Denied!"

  describe 'helpers', ->

    it 'adds a res.backboneError helper', ->
      middleware.helpers @req, @res, @next
      @res.backboneError new Backbone.Model(), { error: 'moo' }
      @next.args[0][0].should.equal 'moo'
express = require 'express'
sinon = require 'sinon'
middleware = require '../../lib/middleware'
Backbone = require 'backbone'
_ = require 'underscore'

describe 'middleware', ->

  beforeEach ->
    @req = {}
    @res = { headers: [] }
    @res.locals =  { sd: {} }
    @res.status = sinon.stub()
    @res.status.returns @res
    @res.send = sinon.stub()
    @res.send.returns @res
    @res.set = (name, value) -> @headers[name] = value
    @next = sinon.stub()

  describe 'locals', ->

    it 'adds some locals', ->
      @req.url = '/foo/bar/baz'
      middleware.locals @req, @res, @next
      @res.locals.sd.URL.should.equal '/foo/bar/baz'

  describe 'helpers', ->

    it 'adds a res.backboneError helper', ->
      middleware.helpers @req, @res, @next
      @res.backboneError new Backbone.Model(), { error: 'moo' }
      @next.args[1][0].error.should.equal 'moo'


  describe 'ua', ->

    it 'adds a IS_MOBILE flag for iOS and Android', ->
      @req.get = -> "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53"
      middleware.ua @req, @res, @next
      @res.locals.sd.IS_MOBILE.should.be.ok

  describe 'sameOrigin', ->

    it 'adds x-frame-options header', ->
      @req.get = -> 'http:'
      middleware.sameOrigin @req, @res, @next
      @res.headers['X-Frame-Options'].should.equal 'SAMEORIGIN'

  describe 'adminOnly middleware', ->

    describe 'is an admin', ->
      beforeEach ->
        @req = user: new Backbone.Model type: 'Admin'

      it 'passes through without error', ->
        middleware.adminOnly @req, {}, @next
        _.isUndefined(@next.args[0][0]).should.be.true()

    describe 'is not an admin', ->
      it 'passes through with the appropriate error', ->
        middleware.adminOnly {}, {}, @next
        @next.args[0][0].message.should.equal 'You must be logged in as an admin'
        @next.args[0][0].status.should.equal 403

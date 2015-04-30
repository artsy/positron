sinon = require 'sinon'
rewire = require 'rewire'
app = rewire '../'
Backbone = require 'backbone'

describe 'impersonate', ->

  beforeEach ->
    user = new Backbone.Model
    user.set type: 'Admin'
    @req = user: user, login: sinon.stub(), params: id: 'foo'
    @res = redirect: sinon.stub()
    @next = sinon.stub()
    @request = get: -> set: -> end: (cb) -> cb null,
      body:
        details: {}
        user: name: 'Molly'
    app.__set__ 'request', @request
    @impersonate = app.__get__ 'impersonate'

  it 'logs in as a fetched user', ->
    @impersonate @req, @res, @next
    @req.login.args[0][0].get('user').name.should.equal 'Molly'

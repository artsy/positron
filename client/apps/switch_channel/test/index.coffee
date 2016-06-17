sinon = require 'sinon'
rewire = require 'rewire'
app = rewire '../'
Backbone = require 'backbone'

describe 'switch_channel', ->

  beforeEach ->
    user = new Backbone.Model
    user.set channel_ids: []
    user.set partner_ids: []
    @req = user: user, login: sinon.stub(), params: id: 'foo'
    @res = redirect: sinon.stub()
    @next = sinon.stub()
    @request = get: -> set: -> end: (cb) -> cb null,
      body:
        details: {}
        name: 'Molly'
    app.__set__ 'request', @request
    @switch_user = app.__get__ 'switchUser'

  it 'switches channel if authorized', ->
    @switch_user @req, @res, @next
    # @req.login.args[0][0].get('name').should.equal 'Molly'

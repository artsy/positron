sinon = require 'sinon'
rewire = require 'rewire'
app = rewire '../'
Backbone = require 'backbone'
Channel = rewire '../../../models/channel.coffee'
{ fabricate } = require 'antigravity'

describe 'authorized switch_channel (channel)', ->

  beforeEach ->
    user = new Backbone.Model
    user.set channel_ids: []
    user.set partner_ids: []
    user.set 'type', 'Admin'
    @channel = new Channel(
      name: 'Artsy Editorial'
      id: '1234'
      type: 'editorial'
    )
    sinon.stub(Channel.prototype,'fetchChannelOrPartner').yieldsTo('success', @channel)
    @req = user: user, login: sinon.stub(), params: id: 'foo'
    @res = redirect: sinon.stub()
    @next = sinon.stub()
    app.__set__ 'Channel', Channel
    @switch_user = app.__get__ 'switchChannel'

  afterEach ->
    Channel.prototype.fetchChannelOrPartner.restore()

  it 'switches', ->
    @switch_user @req, @res, @next
    @req.user.get('current_channel').name.should.equal 'Artsy Editorial'
    @req.user.get('current_channel').id.should.equal '1234'
    @req.user.get('current_channel').type.should.equal 'editorial'

describe 'authorized switch_channel (partner)', ->

  beforeEach ->
    user = new Backbone.Model
    user.set channel_ids: []
    user.set partner_ids: []
    user.set 'type', 'Admin'
    @partner = new Channel
      id: '123'
      name: 'Gagosian'
      type: 'partner'
    sinon.stub(Channel.prototype,'fetchChannelOrPartner').yieldsTo('success', @partner)
    @req = user: user, login: sinon.stub(), params: id: 'foo'
    @res = redirect: sinon.stub()
    @next = sinon.stub()
    @switch_user = app.__get__ 'switchChannel'

  afterEach ->
    Channel.prototype.fetchChannelOrPartner.restore()

  it 'switches', ->
    @switch_user @req, @res, @next
    @req.user.get('current_channel').name.should.equal 'Gagosian'
    @req.user.get('current_channel').type.should.equal 'partner'

describe 'non authorized switch_channel', ->

  beforeEach ->
    user = new Backbone.Model
    user.set channel_ids: []
    user.set partner_ids: []
    user.set 'type', 'Normie'
    @req = user: user, login: sinon.stub(), params: id: 'foo'
    @res = redirect: sinon.stub()
    @next = sinon.stub()
    @switch_user = app.__get__ 'switchChannel'

  it 'returns an error if unauthorized', ->
    @switch_user @req, @res, @next
    @next.called.should.be.true()

  it 'returns an error if unauthorized Admin in channel', ->
    @switch_user @req, @res, @next
    @next.called.should.be.true()

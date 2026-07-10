sinon = require 'sinon'
rewire = require 'rewire'
app = rewire '../'
Backbone = require 'backbone'
Channel = rewire '../../../models/channel.coffee'
User = require '../../../models/user.coffee'
{ fabricate } = require '@artsy/antigravity'
fixtures = require '../../../../test/helpers/fixtures.coffee'

describe 'authorized switch_channel (channel)', ->

  beforeEach ->
    user = new User fixtures().users
    user.set channel_ids: ['1234']
    user.set partner_ids: []
    user.set type: 'Admin'
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
    user = new User fixtures().users
    user.set channel_ids: []
    user.set partner_ids: ['123']
    user.set type: 'User'
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

describe 'switch_channel redirect-to validation', ->

  beforeEach ->
    user = new User fixtures().users
    user.set channel_ids: ['1234']
    user.set partner_ids: []
    user.set type: 'Admin'
    @channel = new Channel(
      name: 'Artsy Editorial'
      id: '1234'
      type: 'editorial'
    )
    sinon.stub(Channel.prototype,'fetchChannelOrPartner').yieldsTo('success', @channel)
    @res = redirect: sinon.stub()
    @next = sinon.stub()
    app.__set__ 'Channel', Channel
    @switch_user = app.__get__ 'switchChannel'
    # login must invoke its callback for the redirect to run
    @switchTo = (redirectTo) =>
      req = user: user, login: ((u, cb) -> cb()), params: id: '1234'
      req.query = 'redirect-to': redirectTo
      @switch_user req, @res, @next

  afterEach ->
    Channel.prototype.fetchChannelOrPartner.restore()

  it 'redirects to a local path', ->
    @switchTo '/articles/123/edit'
    @res.redirect.args[0][0].should.equal '/articles/123/edit'

  it 'preserves the query string on a local path', ->
    @switchTo '/articles/123/edit?foo=bar'
    @res.redirect.args[0][0].should.equal '/articles/123/edit?foo=bar'

  it "defaults to '/' when redirect-to is absent", ->
    @switchTo undefined
    @res.redirect.args[0][0].should.equal '/'

  it 'rejects absolute external URLs', ->
    @switchTo 'https://example.com/security-test'
    @res.redirect.args[0][0].should.equal '/'

  it 'rejects scheme-relative URLs', ->
    @switchTo '//example.com'
    @res.redirect.args[0][0].should.equal '/'

  it 'rejects backslash scheme-relative variants', ->
    @switchTo '/\\example.com'
    @res.redirect.args[0][0].should.equal '/'

describe 'non authorized switch_channel', ->

  beforeEach ->
    user = new User fixtures().users
    user.set channel_ids: []
    user.set partner_ids: []
    user.set type: 'User'
    @req = user: user, login: sinon.stub(), params: id: 'foo'
    @res = redirect: sinon.stub()
    @next = sinon.stub()
    sinon.stub(Channel.prototype,'fetchChannelOrPartner').yieldsTo('error', {})
    @switch_user = app.__get__ 'switchChannel'

  afterEach ->
    Channel.prototype.fetchChannelOrPartner.restore()

  it 'returns an error if channel is not found', ->
    @switch_user @req, @res, @next
    @next.called.should.be.true()

  it 'returns an error if unauthorized Admin in channel', ->
    @partner = new Channel
      id: '123'
      name: 'Gagosian'
      type: 'partner'
    Channel.prototype.fetchChannelOrPartner.yieldsTo('success', @partner)
    @switch_user @req, @res, @next
    @next.called.should.be.true()

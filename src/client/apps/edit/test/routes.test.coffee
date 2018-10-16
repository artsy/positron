routes = require '../routes'
_ = require 'underscore'
Backbone = require 'backbone'
sinon = require 'sinon'
fixtures = require '../../../../test/helpers/fixtures'
rewire = require 'rewire'
User = rewire '../../../models/user'

describe 'routes', ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @req = { query: {}, params: {}, originalUrl: '/edit', user: new User fixtures().users}
    @res = { render: sinon.stub(), locals: { sd: {} }, redirect: sinon.stub() }
    @routes = rewire '../routes.coffee'
    @routes.__set__ 'sd', {NO_INDEX_CHANNELS: '123|456'}
    @routes.__set__ 'getSessionsForChannel', (channel, callback) ->
      new Promise((resolve) ->
        callback(fixtures().sessions) if callback
        resolve(fixtures().sessions)
      )

  afterEach ->
    Backbone.sync.restore()

  describe '#create', ->

    it 'renders an empty article', () ->
      @routes.create(@req, @res)
      @res.render.args[0][0].should.equal 'layout/index'
      @res.render.args[0][1].article.isNew().should.be.ok

    it 'sets defaults for channel types, non partner', ->
      @routes.create @req, @res
      @res.render.args[0][1].article.get('channel_id').should.equal '4d8cd73191a5c50ce200002b'
      @res.render.args[0][1].article.get('author').name.should.equal 'Editorial'

    it 'sets layout to the query param', ->
      @req.query.layout = 'standard'
      @routes.create @req, @res
      @res.render.args[0][1].article.get('layout').should.equal 'standard'

    it 'sets layout to default to classic', ->
      @req.query.layout = null
      @routes.create @req, @res
      @res.render.args[0][1].article.get('layout').should.equal 'classic'

    it 'sets defaults for channel types, partner type', ->
      @req.user.set('current_channel', {
        id: '4d8cd73191a5c50ce200002b'
        name: 'Gagosian'
        type: 'partner'
      })
      @routes.create @req, @res
      @res.render.args[0][1].article.get('partner_channel_id').should.equal '4d8cd73191a5c50ce200002b'
      @res.render.args[0][1].article.get('author').name.should.equal 'Gagosian'
      @res.render.args[0][1].article.get('partner_ids')[0].toString().should.equal '4d8cd73191a5c50ce200002b'

    it 'sets article indexable to false if channel is in NO_INDEX_CHANNELS', ->
      @req.user.set('current_channel', {
        id: '456'
        name: 'Test Channel'
        type: 'editorial'
      })
      @routes.create @req, @res
      @res.render.args[0][1].article.get('indexable').should.eql false

    it 'does not set article indexable if channel is not in NO_INDEX_CHANNELS', ->
      @req.user.set('current_channel', {
        id: '455'
        name: 'Artsy Channel'
        type: 'editorial'
      })
      @routes.create @req, @res
      @res.render.args[0][1].article.attributes.should.not.have.property('indexable')

  describe '#edit', ->

    it 'renders a fetched article', ->
      @req.user.set current_channel: id: '4d8cd73191a5c50ce200002b'
      @req.params.id = 'foo'
      @routes.edit @req, @res
      Backbone.sync.args[0][2].success a = _.extend fixtures().articles, channel_id: '4d8cd73191a5c50ce200002b'
      @res.render.args[0][0].should.equal 'layout/index'
      @res.render.args[0][1].article.get('title').should.equal a.title

    it 'switches channel if article and current_channel do not match', ->
      @req.user.set
        current_channel: id: '123'
        channel_ids: ['5aa99c11da4c00d6bc33a816']
      @req.params.id = 'foo'
      @routes.edit @req, @res
      Backbone.sync.args[0][2].success fixtures().articles
      @res.redirect.calledOnce.should.be.true()

    it 'switches partner channel if article and current_channel do not match', ->
      @req.user.set current_channel: id: '123'
      @req.params.id = 'foo'
      @routes.edit @req, @res
      Backbone.sync.args[0][2].success _.extend fixtures().articles,
        partner_channel_id: '1234'
        channel_id: null
      @res.redirect.calledOnce.should.be.true()
      @res.redirect.args[0][0].should.containEql '/switch_channel/1234?'

  describe 'edit2', ->
    beforeEach ->
      @req.originalUrl = '/edit2'

    it 'sets IS_EDIT_2 for editorial channel', ->
      @req.user.set current_channel: id: '4d8cd73191a5c50ce200002b', type: 'editorial'
      @routes.edit @req, @res
      Backbone.sync.args[0][2].success a = _.extend fixtures().articles, channel_id: '4d8cd73191a5c50ce200002b'

      @res.locals.sd.IS_EDIT_2.should.be.true()

    it 'does not set IS_EDIT_2 for non-editorial channel', ->
      @req.user.set current_channel: id: '4d8cd73191a5c50ce200002b', type: 'partner'
      @routes.edit @req, @res
      Backbone.sync.args[0][2].success a = _.extend fixtures().articles, channel_id: '4d8cd73191a5c50ce200002b'

      @res.locals.sd.IS_EDIT_2.should.not.be.true()

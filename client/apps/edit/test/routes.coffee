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
    @req = { query: {}, params: {}, user: new User fixtures().users }
    @res = { render: sinon.stub(), locals: { sd: {} }, redirect: sinon.stub() }

  afterEach ->
    Backbone.sync.restore()

  describe '#create', ->

    it 'renders an empty article', ->
      routes.create @req, @res
      @res.render.args[0][0].should.equal 'layout/index'
      @res.render.args[0][1].article.isNew().should.be.ok

    it 'sets defaults for channel types, non partner', ->
      routes.create @req, @res
      @res.render.args[0][1].article.get('channel_id').should.equal '4d8cd73191a5c50ce200002b'
      @res.render.args[0][1].article.get('author').name.should.equal 'Editorial'

    it 'sets defaults for channel types, partner type', ->
      @req.user.set('current_channel', {
        id: '4d8cd73191a5c50ce200002b'
        name: 'Gagosian'
        type: 'partner'
      })
      routes.create @req, @res
      @res.render.args[0][1].article.get('partner_channel_id').should.equal '4d8cd73191a5c50ce200002b'
      @res.render.args[0][1].article.get('author').name.should.equal 'Gagosian'
      @res.render.args[0][1].article.get('partner_ids')[0].toString().should.equal '4d8cd73191a5c50ce200002b'

  describe '#edit', ->

    it 'renders a fetched article', ->
      @req.user.set id: 'bar'
      @req.params.id = 'foo'
      routes.edit @req, @res
      Backbone.sync.args[0][2].success a = _.extend fixtures().articles,
        author_id: 'bar'
      @res.render.args[0][0].should.equal 'layout/index'
      @res.render.args[0][1].article.get('title').should.equal a.title

routes = require '../routes'
_ = require 'underscore'
Backbone = require 'backbone'
sinon = require 'sinon'
fixtures = require '../../../../test/helpers/fixtures'
CurrentUser = require '../../../models/current_user'

describe 'routes', ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @req = { query: {}, params: {}, user: new CurrentUser fixtures().users }
    @res = { render: sinon.stub(), locals: sd: {} }

  afterEach ->
    Backbone.sync.restore()

  describe '#create', ->

    it 'renders an empty article', ->
      routes.create @req, @res
      @res.render.args[0][0].should.equal 'layout/index'
      @res.render.args[0][1].article.isNew().should.be.ok

  describe '#edit', ->

    it 'renders a fetched article', ->
      @req.params.id = 'foo'
      routes.edit @req, @res
      Backbone.sync.args[0][2].success a = fixtures().articles
      @res.render.args[0][0].should.equal 'layout/index'
      @res.render.args[0][1].article.get('title').should.equal a.title
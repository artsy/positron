routes = require '../routes'
_ = require 'underscore'
Backbone = require 'backbone'
sinon = require 'sinon'
fixtures = require '../../../../test/helpers/fixtures'
CurrentUser = require '../../../models/current_user'

describe 'routes', ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @req = { query: {}, user: new CurrentUser fixtures().users }
    @res = { render: sinon.stub(), locals: fixtures().locals }

  afterEach ->
    Backbone.sync.restore()

  describe '#articles', ->

    it 'fetches a page of articles', ->
      routes.articles @req, @res
      Backbone.sync.args[0][2].success {
        results: [_.extend(fixtures().articles, title: "mooo")]
      }
      @res.render.args[0][1].articles[0].get('title').should.equal 'mooo'

    it 'can filter based on query params', ->
      @req.query.published = true
      routes.articles @req, @res
      Backbone.sync.args[0][2].data.published.should.be.ok
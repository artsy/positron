_ = require 'underscore'
resolvers = require '../resolvers.coffee'
{ where } = Article = require '../../articles/model'
sinon = require 'sinon'
{ fixtures, db } = require '../../../test/helpers/db'
app = require '../../../'

describe 'resolvers', ->

  beforeEach ->
    sinon.stub(Article, 'where')
    @next = sinon.stub()
    @ctx = {
      req: @req = query: {}
      res: @res = {}
    }

  afterEach ->
    Article.where.restore()

  describe 'articles', ->

    it 'sends a list of articles', ->
      @req.query = published: true
      resolvers.articles @ctx, @next
      @Article.where.args[0][1] null, {
        total: 10
        count: 1
        results: [fixtures().articles]
      }
      @ctx.res.articles.length.should.equal 1

    it 'restricts the usage to published articles only', ->
      @req.query = published: false
      resolvers.articles @ctx, @next
      @Article.where.args[0][1] null, {
        total: 10
        count: 1
        results: [fixtures().articles]
      }
      @ctx.res.articles.length.should.equal 0

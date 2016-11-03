_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
rewire = require 'rewire'
resolvers = rewire '../resolvers.coffee'
sinon = require 'sinon'

describe 'resolvers', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {}, (err, @user) =>
        @server = app.listen 5000, ->
          done()

  afterEach ->
    @server.close()

  beforeEach ->
    resolvers.__set__ 'where', @where = sinon.stub()
    @next = sinon.stub()
    @ctx = {
      req: @req = query: { articles: {} }
      res: @res = { articles: [] }
    }

  describe 'articles', ->

    it 'restricts the usage to published articles only', ->
      @req.query.articles.args = published: false
      resolvers.articles @ctx, @next
      @ctx.res.articles.length.should.equal 0

    it 'defaults to published articles', ->
      @req.query.articles.args = tier: 1
      resolvers.articles @ctx, @next
      @where.args[0][0].published.should.be.true()
      @where.args[0][1] null, {
        total: 10
        count: 1
        results: [fixtures().articles]
      }
      @ctx.res.articles.length.should.equal 1

    it 'sends a list of articles', ->
      @req.query.articles.args = published: true
      resolvers.articles @ctx, @next
      @where.args[0][1] null, {
        total: 10
        count: 1
        results: [fixtures().articles]
      }
      @ctx.res.articles.length.should.equal 1

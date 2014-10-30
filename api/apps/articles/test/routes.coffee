_ = require 'underscore'
{ fixtures } = require '../../../test/helpers/db'
sinon = require 'sinon'
rewire = require 'rewire'
routes = rewire '../routes'
{ ObjectId } = require 'mongojs'

describe 'routes', ->

  beforeEach ->
    @Article = routes.__get__ 'Article'
    for method in @methods = ['where', 'save', 'destroy', 'find']
      sinon.stub @Article, method
    @req =
      query: {}
      body: {}
      params: {}
      user: _.extend(fixtures().users, _id: ObjectId '5086df098523e60002000012')
    @res = { send: sinon.stub(), err: sinon.stub() }
    @next = sinon.stub()

  afterEach ->
    @Article[method].restore() for method in @methods

  describe '#index', ->

    it 'sends a list of articles by author', ->
      @req.query.author_id = @req.user._id = 'fooid'
      routes.index @req, @res, @next
      @Article.where.args[0][0].author_id.should.equal @req.user._id
      @Article.where.args[0][1] null, {
        total: 10
        count: 1
        results: [fixtures().articles]
      }
      @res.send.args[0][0].results[0].title.should.containEql 'Top Ten'

    it 'sends a list of articles by author', ->
      routes.index @req, @res, @next
      @res.err.args[0][0].should.equal 401

  describe '#show', ->

    it 'sends a single article', ->
      @req.article = fixtures().articles
      routes.show @req, @res
      @res.send.args[0][0].title.should.containEql 'Top Ten'

  describe '#create', ->

    it 'creates an article with data', ->
      @req.body.title = "Foo Bar"
      routes.create @req, @res
      @Article.save.args[0][1] null, fixtures().articles
      @res.send.args[0][0].title.should.containEql 'Top Ten'

  describe '#update', ->

    it 'updates an existing article', ->
      @req.article = fixtures().articles
      @req.body.title = "Foo Bar"
      routes.create @req, @res
      @Article.save.args[0][1] null, fixtures().articles
      @res.send.args[0][0].title.should.containEql 'Top Ten'

    it 'defaults to the logged in user for author_id', ->
      @req.user = _.extend(fixtures().users,
        _id: ObjectId('4d8cd73191a5c50ce210002a')
      )
      @req.article = fixtures().articles
      routes.create @req, @res
      @Article.save.args[0][0].author_id.should.equal @req.user._id

  describe '#delete', ->

    it 'delets an existing article', ->
      @req.article = fixtures().articles
      routes.delete @req, @res
      @Article.destroy.args[0][1]()
      @res.send.args[0][0].title.should.containEql 'Top Ten'

  describe '#find', ->

    it 'looks for an article and attaches it to req', ->
      @req.params.id = 'foo'
      routes.find @req, @res, @next
      @Article.find.args[0][0].should.equal 'foo'
      @Article.find.args[0][1] null, _.extend fixtures().articles,
        title: 'foo to the baz'
        author_id: @req.user._id
      @req.article.title.should.equal 'foo to the baz'
      @next.called.should.be.ok

    it 'throws a 404 for articles from non-authors', ->
      routes.find @req, @res, @next
      @Article.find.args[0][1] null, _.extend(fixtures().articles,
        author_id: ObjectId('4d8cd73191a5c50ce210002a')
      )
      @res.err.args[0][0].should.equal 404
_ = require 'underscore'
{ fixtures } = require '../../../test/helpers/db'
sinon = require 'sinon'
rewire = require 'rewire'
routes = rewire '../routes.coffee'
{ ObjectId } = require 'mongojs'

describe 'routes', ->

  beforeEach ->
    @Article = routes.__get__ 'Article'
    @User = routes.__get__ 'User'
    for method in @methods = ['where', 'save', 'destroy', 'find']
      sinon.stub @Article, method
    @req =
      query: {}
      body: {}
      params: {}
      get: ->
      user: _.extend({}, fixtures().users, _id: ObjectId '5086df098523e60002000012')
    @res = { send: sinon.stub(), err: sinon.stub() }
    @next = sinon.stub()

  afterEach ->
    @Article[method].restore() for method in @methods

  describe '#index', ->

    it 'sends a list of published articles by author', ->
      @req.query.author_id = @req.user._id = 'fooid'
      @req.query.published = 'true'
      routes.index @req, @res, @next
      @Article.where.args[0][0].author_id.should.equal @req.user._id
      @Article.where.args[0][1] null, {
        total: 10
        count: 1
        results: [fixtures().articles]
      }
      @res.send.args[0][0].results[0].title.should.containEql 'Top Ten'

    it 'returns an error if channel_id is not provided for unpublished', ->
      @req.query.published = 'false'
      routes.index @req, @res, @next
      @res.err.args[0][0].should.equal 401
      @res.err.args[0][1].should.containEql 'Must pass channel_id to view unpublished articles'

    it 'denies unpublished articles to non channel members', ->
      @User.hasChannelAccess = sinon.stub().returns false
      @req.query.published = 'false'
      @req.query.channel_id = '123456'
      routes.index @req, @res, @next
      @res.err.args[0][0].should.equal 401
      @res.err.args[0][1].should.containEql 'Must be a member of this channel'

    it 'allows unpublished for a channel member', ->
      @User.hasChannelAccess = sinon.stub().returns true
      @req.query.published = 'false'
      @req.query.channel_id = '123456'
      routes.index @req, @res, @next
      @Article.where.args[0][1] null, {
        total: 10
        count: 1
        results: [fixtures().articles]
      }
      @res.send.args[0][0].results[0].title.should.containEql 'Top Ten'

  describe '#show', ->

    it 'sends a single article', ->
      @req.article = fixtures().articles
      routes.show @req, @res
      @res.send.args[0][0].title.should.containEql 'Top Ten'

    it 'throws a 404 for articles from non channel members', ->
      @User.hasChannelAccess = sinon.stub().returns false
      @req.user.type = 'User'
      @req.article = _.extend {}, fixtures().articles,
        published: false
        channel_id: ObjectId('4d8cd73191a5c50ce210002a')
      routes.show @req, @res, @next
      @res.err.args[0][0].should.equal 404

  describe '#create', ->

    it 'creates an article with data', ->
      @User.hasChannelAccess = sinon.stub().returns true
      @req.body.title = "Foo Bar"
      routes.create @req, @res
      @Article.save.args[0][2] null, fixtures().articles
      @res.send.args[0][0].title.should.containEql 'Top Ten'

  describe '#update', ->

    it 'updates an existing article', ->
      @req.article = fixtures().articles
      @req.body.title = "Foo Bar"
      routes.create @req, @res
      @Article.save.args[0][2] null, fixtures().articles
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

    it 'shows published articles', ->
      routes.find @req, @res, @next
      @Article.find.args[0][1] null, _.extend(fixtures().articles,
        author_id: ObjectId('4d8cd73191a5c50ce210002a')
        published: true
        title: 'Andy Foobar and The Gang'
      )
      @res.err.called.should.not.be.ok
      @req.article.title.should.equal 'Andy Foobar and The Gang'

    it 'shows unpublished articles to admins', ->
      @req.user.type = 'Admin'
      routes.find @req, @res, @next
      @Article.find.args[0][1] null, _.extend(fixtures().articles,
        author_id: ObjectId('4d8cd73191a5c50ce210002a')
        published: false
        title: 'Andy Foobar and The Gang'
      )
      @req.article.title.should.equal 'Andy Foobar and The Gang'

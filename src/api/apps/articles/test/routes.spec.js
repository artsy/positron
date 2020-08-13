/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require("underscore")
const { fixtures } = require("../../../test/helpers/db")
const sinon = require("sinon")
const rewire = require("rewire")
const routes = rewire("../routes.coffee")
const { ObjectId } = require("mongojs")

describe("routes", function() {
  beforeEach(function() {
    this.Article = routes.__get__("Article")
    this.User = routes.__get__("User")
    for (let method of Array.from(
      (this.methods = ["where", "save", "destroy", "find"])
    )) {
      sinon.stub(this.Article, method)
    }
    this.req = {
      query: {},
      body: {},
      params: {},
      get() {},
      user: _.extend({}, fixtures().users, {
        _id: ObjectId("5086df098523e60002000012"),
      }),
    }
    this.res = { send: sinon.stub(), err: sinon.stub() }
    this.next = sinon.stub()
  })

  afterEach(function() {
    Array.from(this.methods).map(method =>
      this.Article[method].restore()
    )
  })

  describe("#index", function() {
    it("sends a list of published articles by author", function() {
      this.req.query.author_id = this.req.user._id = "fooid"
      this.req.query.published = "true"
      routes.index(this.req, this.res, this.next)
      this.Article.where.args[0][0].author_id.should.equal(this.req.user._id)
      this.Article.where.args[0][1](null, {
        total: 10,
        count: 1,
        results: [fixtures().articles],
      })
      this.res.send.args[0][0].results[0].title.should.containEql(
        "Top Ten"
      )
    })

    it("returns an error if channel_id is not provided for unpublished", function() {
      this.req.query.published = "false"
      routes.index(this.req, this.res, this.next)
      this.res.err.args[0][0].should.equal(401)
      this.res.err.args[0][1].should.containEql(
        "Must pass channel_id to view unpublished articles"
      )
    })

    it("denies unpublished articles to non channel members", function() {
      this.User.hasChannelAccess = sinon.stub().returns(false)
      this.req.query.published = "false"
      this.req.query.channel_id = "123456"
      routes.index(this.req, this.res, this.next)
      this.res.err.args[0][0].should.equal(401)
      this.res.err.args[0][1].should.containEql(
        "Must be a member of this channel"
      )
    })

    it("allows unpublished for a channel member", function() {
      this.User.hasChannelAccess = sinon.stub().returns(true)
      this.req.query.published = "false"
      this.req.query.channel_id = "123456"
      routes.index(this.req, this.res, this.next)
      this.Article.where.args[0][1](null, {
        total: 10,
        count: 1,
        results: [fixtures().articles],
      })
      this.res.send.args[0][0].results[0].title.should.containEql(
        "Top Ten"
      )
    })
  })

  describe("#show", function() {
    it("sends a single article", function() {
      this.req.article = fixtures().articles
      routes.show(this.req, this.res)
      this.res.send.args[0][0].title.should.containEql("Top Ten")
    })

    it("throws a 404 for articles from non channel members", function() {
      this.User.hasChannelAccess = sinon.stub().returns(false)
      this.req.user.type = "User"
      this.req.article = _.extend({}, fixtures().articles, {
        published: false,
        channel_id: ObjectId("4d8cd73191a5c50ce210002a"),
      })
      routes.show(this.req, this.res, this.next)
      this.res.err.args[0][0].should.equal(404)
    })
  })

  describe("#create", () =>
    it("creates an article with data", function() {
      this.User.hasChannelAccess = sinon.stub().returns(true)
      this.req.body.title = "Foo Bar"
      routes.create(this.req, this.res)
      this.Article.save.args[0][3](null, fixtures().articles)
      this.res.send.args[0][0].title.should.containEql("Top Ten")
    }))

  describe("#update", function() {
    it("updates an existing article", function() {
      this.req.article = fixtures().articles
      this.req.body.title = "Foo Bar"
      routes.create(this.req, this.res)
      this.Article.save.args[0][3](null, fixtures().articles)
      this.res.send.args[0][0].title.should.containEql("Top Ten")
    })

    it("defaults to the logged in user for author_id", function() {
      this.req.user = _.extend(fixtures().users, {
        _id: ObjectId("4d8cd73191a5c50ce210002a"),
      })
      this.req.article = fixtures().articles
      routes.create(this.req, this.res)
      this.Article.save.args[0][0].author_id.should.equal(
        this.req.user._id.toString()
      )
    })
  })

  describe("#delete", () =>
    it("deletes an existing article", function() {
      this.req.article = fixtures().articles
      routes.delete(this.req, this.res)
      this.Article.destroy.args[0][1]()
      this.res.send.args[0][0].title.should.containEql("Top Ten")
    }))

  describe("#find", function() {
    it("looks for an article and attaches it to req", function() {
      this.req.params.id = "foo"
      routes.find(this.req, this.res, this.next)
      this.Article.find.args[0][0].should.equal("foo")
      this.Article.find.args[0][1](
        null,
        _.extend(fixtures().articles, {
          title: "foo to the baz",
          author_id: this.req.user._id,
        })
      )
      this.req.article.title.should.equal("foo to the baz")
      this.next.called.should.be.ok
    })

    it("shows published articles", function() {
      routes.find(this.req, this.res, this.next)
      this.Article.find.args[0][1](
        null,
        _.extend(fixtures().articles, {
          author_id: ObjectId("4d8cd73191a5c50ce210002a"),
          published: true,
          title: "Andy Foobar and The Gang",
        })
      )
      this.res.err.called.should.not.be.ok
      this.req.article.title.should.equal("Andy Foobar and The Gang")
    })

    it("shows unpublished articles to admins", function() {
      this.req.user.type = "Admin"
      routes.find(this.req, this.res, this.next)
      this.Article.find.args[0][1](
        null,
        _.extend(fixtures().articles, {
          author_id: ObjectId("4d8cd73191a5c50ce210002a"),
          published: false,
          title: "Andy Foobar and The Gang",
        })
      )
      this.req.article.title.should.equal("Andy Foobar and The Gang")
    })
  })
})

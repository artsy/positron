import moment from "moment"
import { ObjectId } from "mongodb"
import rewire from "rewire"
import { extend, times } from "underscore"
import sinon from "sinon"
const {
  db,
  fabricate,
  empty,
  fixtures,
} = require("../../../../../test/helpers/db.coffee")
const gravity = require("@artsy/antigravity").server
const app = require("express")()
const Article = rewire("../../../model/index.js")
const search = require("../../../../../lib/elasticsearch.coffee")
const { amqp } = require("../../../../../lib/amqp")

process.env.ENABLE_PUBLISH_RABBITMQ_EVENTS = "true"

describe("Article", () => {
  let server
  let publishStub
  let sandbox

  // @ts-ignore
  before(done => {
    app.use("/__gravity", gravity)
    server = app.listen(5000, () =>
      search.client.indices.create(
        { index: "articles_" + process.env.NODE_ENV },
        () => done()
      )
    )
  })
  // @ts-ignore
  after(() => {
    server.close()
    search.client.indices.delete({
      index: "articles_" + process.env.NODE_ENV,
    })
  })

  beforeEach(done => {
    sandbox = sinon.createSandbox()
    publishStub = sandbox.stub(amqp, "publish")
    empty(() => fabricate("articles", times(10, () => ({})), () => done()))
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe("#publishScheduledArticles", () => {
    it("calls #save on each article that needs to be published", done => {
      fabricate(
        "articles",
        {
          _id: new ObjectId("54276766fd4f50996aeca2b8"),
          author_id: new ObjectId("5086df098523e60002000018"),
          channel_id: "5086df098523e60002000018",
          published: false,
          scheduled_publish_at: moment("2016-01-01").toDate(),
          author: {
            name: "Kana Abe",
          },
          sections: [
            {
              type: "text",
              body: "The start of a new article",
            },
            {
              type: "image_collection",
              layout: "overflow_fillwidth",
              images: [
                {
                  url: "https://image.png",
                  caption: "Trademarked",
                },
              ],
            },
          ],
        },
        () =>
          Article.publishScheduledArticles((_err, results) => {
            results[0].published.should.be.true()
            results[0].published_at.toString().should.equal(
              moment("2016-01-01")
                .toDate()
                .toString()
            )
            results[0].sections[0].body.should.containEql(
              "The start of a new article"
            )
            results[0].sections[1].images[0].url.should.containEql(
              "https://image.png"
            )
            publishStub.callCount.should.eql(1)

            done()
          })
      )
    })
  })

  describe("#unqueue", () =>
    it("calls #save on each article that needs to be unqueued", done =>
      fabricate(
        "articles",
        {
          _id: new ObjectId("54276766fd4f50996aeca2b8"),
          channel_id: "5086df098523e60002000018",
          weekly_email: true,
          daily_email: true,
          author: {
            name: "Kana Abe",
          },
          sections: [],
        },
        () =>
          Article.unqueue((_err, results) => {
            results[0].weekly_email.should.be.false()
            results[0].daily_email.should.be.false()

            done()
          })
      )))

  describe("#destroy", () => {
    it("removes an article", done =>
      fabricate(
        "articles",
        { _id: new ObjectId("5086df098523e60002000018") },
        () =>
          Article.destroy("5086df098523e60002000018", _err => {
            return db.collection("articles").count((_error, count) => {
              count.should.equal(10)
              done()
            })
          })
      ))

    it("returns an error message", done =>
      Article.destroy("5086df098523e60002000019", err => {
        err.message.should.equal("Article not found.")
        done()
      }))

    it("removes the article from elasticsearch", done =>
      fabricate(
        "articles",
        { _id: new ObjectId("5086df098523e60002000019"), title: "quux" },
        () =>
          setTimeout(
            () =>
              Article.destroy("5086df098523e60002000019", _err =>
                setTimeout(
                  () =>
                    search.client.search(
                      {
                        index: search.index,
                        q: "title:quux",
                      },
                      (_error, response) => {
                        response.hits.hits.length.should.equal(0)
                        done()
                      }
                    ),
                  1000
                )
              ),
            1000
          )
      ))
  })

  describe("#present", () => {
    it("adds both _id and id", () => {
      const result = Article.present(
        extend({}, fixtures().articles, { _id: "foo" })
      )
      result.id.should.equal("foo")
      result._id.should.equal("foo")
    })

    it("converts dates to ISO strings", () => {
      const result = Article.present(
        extend({}, fixtures().articles, {
          published_at: new Date(),
          scheduled_publish_at: new Date(),
        })
      )
      moment(result.updated_at)
        .toISOString()
        // @ts-ignore
        .should.equal(result.updated_at)
      moment(result.published_at)
        .toISOString()
        // @ts-ignore
        .should.equal(result.published_at)
      moment(result.scheduled_publish_at)
        .toISOString()
        // @ts-ignore
        .should.equal(result.scheduled_publish_at)
    })
  })

  describe("#presentCollection", () =>
    it("shows a total/count/results hash for arrays of articles", () => {
      const result = Article.presentCollection({
        total: 10,
        count: 1,
        results: [extend({}, fixtures().articles, { _id: "baz" })],
      })
      result.results[0].id.should.equal("baz")
    }))

  describe("#getSuperArticleCount", () => {
    it("returns 0 if the id is invalid", () => {
      const id = "123"
      Article.getSuperArticleCount(id).then(count => count.should.equal(0))
    })

    it("returns a count of super articles that have the given id as a related article", () =>
      fabricate(
        "articles",
        {
          _id: new ObjectId("54276766fd4f50996aeca2b8"),
          super_article: {
            related_articles: [new ObjectId("5086df098523e60002000018")],
          },
        },
        () => {
          const id = "5086df098523e60002000018"
          Article.getSuperArticleCount(id).then(count => count.should.equal(1))
        }
      ))
  })

  describe("#promisedMongoFetch", () =>
    it("returns results, counts, and totals", () =>
      fabricate(
        "articles",
        { _id: new ObjectId("5086df098523e60002000018") },
        () =>
          Article.promisedMongoFetch({
            count: true,
            ids: [new ObjectId("5086df098523e60002000018")],
          }).then(({ count, total, results }) => {
            count.should.equal(1)
            total.should.equal(11)
            results.length.should.equal(1)
          })
      )))

  describe("#mongoFetch", () =>
    it("returns results, counts, and totals", done =>
      fabricate(
        "articles",
        { _id: new ObjectId("5086df098523e60002000018"), layout: "video" },
        () =>
          Article.mongoFetch(
            {
              count: true,
              limit: 5,
              offset: 0,
              layout: "standard",
            },
            // @ts-ignore
            (err, res) => {
              res.results.length.should.equal(5)
              res.total.should.equal(11)
              res.count.should.equal(10)
              done()
            }
          )
      )))
})

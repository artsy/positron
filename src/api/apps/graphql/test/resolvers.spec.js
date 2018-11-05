import _ from "underscore"
import moment from "moment"
import rewire from "rewire"
import sinon from "sinon"
const app = require("api/index.coffee")
const { fixtures, fabricate, empty } = require("api/test/helpers/db.coffee")
const resolvers = rewire("../resolvers.js")
const { ObjectId } = require("mongojs")

describe("resolvers", () => {
  let article, articles, server, promisedMongoFetch
  const req = { user: { channel_ids: ["456"] } }

  before(done => {
    empty(() => {
      fabricate("users", { channel_ids: ["456"] }, (err, user) => {
        if (err) {
          done(err)
        }
        server = app.listen(5000, () => done())
      })
    })
  })

  beforeEach(() => {
    articles = {
      total: 20,
      count: 1,
      results: [
        _.extend(fixtures().articles, {
          slugs: ["slug-1"],
          tags: ["dog"],
          vertical: { id: "54276766fd4f50996aeca2b3" },
        }),
      ],
    }
    article = _.extend({}, fixtures().articles, {
      slugs: ["slug-2"],
      channel_id: "456",
    })
    const authors = { total: 20, count: 1, results: [fixtures().authors] }
    const channels = { total: 20, count: 1, results: [fixtures().channels] }
    const curations = { total: 20, count: 1, results: [fixtures().curations] }
    const tags = { total: 20, count: 1, results: [fixtures().tags] }
    promisedMongoFetch = sinon.stub()
    resolvers.__set__("mongoFetch", sinon.stub().yields(null, articles))
    resolvers.__set__("promisedMongoFetch", promisedMongoFetch)
    resolvers.__set__("Author", {
      mongoFetch: sinon.stub().yields(null, authors),
    })
    resolvers.__set__("Channel", {
      mongoFetch: sinon.stub().yields(null, channels),
    })
    resolvers.__set__("Curation", {
      mongoFetch: sinon.stub().yields(null, curations),
    })
    resolvers.__set__("Tag", { mongoFetch: sinon.stub().yields(null, tags) })
  })

  afterEach(() => {
    server.close()
  })

  describe("articles", () => {
    it("returns throws error when trying to view a draft without channel_id", () => {
      const args = { published: false }
      resolvers.articles.bind({}, args, {}, {}).should.throw()
    })

    it("returns throws an error when trying to view an unauthorized draft", () => {
      const args = { published: false, channel_id: "123" }
      resolvers.articles.bind({}, args, {}, {}).should.throw()
    })

    it("can view drafts", async () => {
      const args = { published: false, channel_id: "456" }
      const results = await resolvers.articles({}, args, req, {})
      results.length.should.equal(1)
      results[0].slug.should.equal("slug-1")
    })

    it("can view published articles", async () => {
      const args = { published: true }
      const results = await resolvers.articles({}, args, req, {})
      results.length.should.equal(1)
      results[0].slug.should.equal("slug-1")
    })
  })

  describe("article", () => {
    it("rejects with an error when no article is found", async () => {
      const args = { id: "123" }
      resolvers.__set__("find", sinon.stub().yields(null, null))
      try {
        await resolvers.article({}, args, {}, {})
      } catch (err) {
        err.toString().should.containEql("Article not found.")
      }
    })

    it("rejects with an error when trying to view an unauthorized draft", async () => {
      const args = { id: "123" }
      const newArticle = _.extend({}, article, {
        channel_id: "000",
        published: false,
      })
      resolvers.__set__("find", sinon.stub().yields(null, newArticle))
      try {
        await resolvers.article({}, args, {}, {})
      } catch (err) {
        err.toString().should.containEql("Must be a member of the channel")
      }
    })

    it("can view drafts", async () => {
      const args = { id: "123" }
      const newArticle = _.extend({}, article, { published: false })
      resolvers.__set__("find", sinon.stub().yields(null, newArticle))
      const results = await resolvers.article({}, args, req, {})
      results.slug.should.equal("slug-2")
    })

    it("can view published articles", async () => {
      const args = { id: "123" }
      resolvers.__set__("find", sinon.stub().yields(null, article))
      const results = await resolvers.article({}, args, req, {})
      results.slug.should.equal("slug-2")
    })
  })

  describe("authors", () => {
    it("can find authors", async () => {
      const results = await resolvers.authors({}, {}, req, {})
      results.length.should.equal(1)
      results[0].name.should.equal("Halley Johnson")
      results[0].bio.should.equal("Writer based in NYC")
      results[0].twitter_handle.should.equal("kanaabe")
      results[0].image_url.should.equal("https://artsy-media.net/halley.jpg")
    })
  })

  describe("relatedAuthors", () => {
    it("can find authors", async () => {
      const root = { author_ids: [{ id: "123" }] }
      const results = await resolvers.relatedAuthors(root)
      results.length.should.equal(1)
      results[0].name.should.equal("Halley Johnson")
      results[0].bio.should.equal("Writer based in NYC")
      results[0].twitter_handle.should.equal("kanaabe")
      results[0].image_url.should.equal("https://artsy-media.net/halley.jpg")
    })

    it("returns null if there are no authors from fetch", async () => {
      resolvers.__set__("Author", {
        mongoFetch: sinon.stub().yields(null, { results: [] }),
      })
      const root = { author_ids: [{ id: "123" }] }
      const results = await resolvers.relatedAuthors(root)
      _.isNull(results).should.be.true()
    })

    it("returns null if the article has no author_ids", async () => {
      const root = { author_ids: null }
      const results = await resolvers.relatedAuthors(root)
      _.isNull(results).should.be.true()
    })
  })

  describe("channels", () => {
    it("can find channels", async () => {
      const results = await resolvers.channels({}, {}, req, {})
      results.length.should.equal(1)
      results[0].name.should.equal("Editorial")
      results[0].type.should.equal("editorial")
    })
  })

  describe("curations", () => {
    it("can find curations", async () => {
      const results = await resolvers.curations({}, {}, req, {})
      results.length.should.equal(1)
      results[0].name.should.equal("Featured Articles")
    })
  })

  describe("display", () => {
    it("can fetch campaign data", async () => {
      const display = {
        total: 20,
        count: 4,
        results: [
          {
            campaigns: [
              fixtures().display,
              fixtures().display,
              fixtures().display,
              fixtures().display,
            ],
          },
        ],
      }
      resolvers.__set__("Curation", {
        mongoFetch: sinon.stub().yields(null, display),
      })

      const result = await resolvers.display({}, {}, req, {})
      result.name.should.equal("Sample Campaign")
      result.canvas.headline.should.containEql("Sample copy")
      result.panel.headline.should.containEql("Euismod Inceptos Quam")
    })

    it("selects a campaign based on a counter", async () => {
      const display = {
        total: 20,
        count: 4,
        results: [
          {
            campaigns: [
              { ...fixtures().display, name: 0 },
              { ...fixtures().display, name: 1 },
              { ...fixtures().display, name: 2 },
              { ...fixtures().display, name: 3 },
              { ...fixtures().display, name: 4 },
            ],
          },
        ],
      }
      resolvers.__set__("Curation", {
        mongoFetch: sinon.stub().yields(null, display),
      })

      const result = await resolvers.display({}, {}, req, {})
      const nextResult = await resolvers.display({}, {}, req, {})
      nextResult.name.should.equal(result.name + 1)
    })

    it("rejects if SOV is over 100%", async () => {
      const display = {
        total: 20,
        count: 2,
        results: [
          {
            campaigns: [
              fixtures().display,
              fixtures().display,
              fixtures().display,
              fixtures().display,
              fixtures().display,
            ],
          },
        ],
      }
      resolvers.__set__("Curation", {
        mongoFetch: sinon.stub().yields(null, display),
      })

      await resolvers.display({}, {}, req, {}).catch(e => {
        e.message.should.containEql(
          "Share of voice sum cannot be greater than 100"
        )
      })
    })

    it("resolves null if there are no results", async () => {
      const display = {
        total: 20,
        count: 1,
        results: [],
      }
      resolvers.__set__("Curation", {
        mongoFetch: sinon.stub().yields(null, display),
      })
      const result = await resolvers.display({}, {}, req, {})
      _.isNull(result).should.be.true()
    })

    it("resolves null if there are no campaigns", async () => {
      const display = {
        total: 20,
        count: 1,
        results: [{ campaigns: [] }],
      }
      resolvers.__set__("Curation", {
        mongoFetch: sinon.stub().yields(null, display),
      })

      const result = await resolvers.display({}, {}, req, {})
      _.isNull(result).should.be.true()
    })

    describe("inactive campaigns", () => {
      const now = () => moment(new Date())

      const getDisplayData = async ({ startDate, endDate }) => {
        const campaign = {
          ...fixtures().display,
          start_date: startDate.toDate(),
          end_date: endDate.toDate(),
        }

        const display = {
          total: 20,
          count: 4,
          results: [
            {
              campaigns: [campaign, campaign, campaign, campaign, campaign],
            },
          ],
        }

        resolvers.__set__("Curation", {
          mongoFetch: sinon.stub().yields(null, display),
        })

        const result = await resolvers.display({}, {}, req, {})
        return result
      }

      it("does not filter active campaigns", async () => {
        const inValidRange = await getDisplayData({
          startDate: now().subtract(1, "day"),
          endDate: now().add(1, "day"),
        })
        inValidRange.should.not.equal(null)
      })

      it("filters out if start date greater than now", async () => {
        const result = await getDisplayData({
          startDate: now().add(1, "days"),
          endDate: now().add(2, "days"),
        })
        _.isNull(result).should.be.true()
      })

      it("filters out if end date less than now", async () => {
        const result = await getDisplayData({
          startDate: now().subtract(3, "days"),
          endDate: now().subtract(2, "days"),
        })
        _.isNull(result).should.be.true()
      })
    })
  })

  describe("relatedArticles", () => {
    it("can find related articles for the series", async () => {
      promisedMongoFetch.onFirstCall().resolves(articles)
      const results = await resolvers.relatedArticles({
        id: "54276766fd4f50996aeca2b8",
        related_article_ids: ["54276766fd4f50996aeca2b9"],
      })
      results.length.should.equal(1)
    })

    it("resolves null if it does not have related articles", async () => {
      promisedMongoFetch.onFirstCall().resolves({ results: [] })
      const results = await resolvers.relatedArticles({
        id: "54276766fd4f50996aeca2b8",
      })
      _.isNull(results).should.be.true()
    })
  })

  describe("relatedArticlesCanvas", () => {
    it("can find related articles for the canvas", async () => {
      promisedMongoFetch.onFirstCall().resolves(articles)
      const results = await resolvers.relatedArticlesCanvas({
        id: "54276766fd4f50996aeca2b8",
        vertical: { id: "54276766fd4f50996aeca2b3" },
      })
      results.length.should.equal(1)
      results[0].vertical.id.should.equal("54276766fd4f50996aeca2b3")
    })

    it("resolves null if it does not have articles", async () => {
      promisedMongoFetch.onFirstCall().resolves({ results: [] })
      const results = await resolvers.relatedArticlesCanvas({
        id: "54276766fd4f50996aeca2b8",
        vertical: { id: "54276766fd4f50996aeca2b3" },
      })
      _.isNull(results).should.be.true()
    })
  })

  describe("relatedArticlesPanel", () => {
    it("can find related articles for the panel without related_article_ids", async () => {
      promisedMongoFetch.onFirstCall().resolves(articles)
      const results = await resolvers.relatedArticlesPanel({
        id: "54276766fd4f50996aeca2b8",
        tags: ["dog", "cat"],
      })
      results.length.should.equal(1)
      results[0].tags[0].should.equal("dog")
    })

    it("can find related articles for the panel with related_article_ids", async () => {
      const relatedArticles = {
        results: [
          _.extend({}, fixtures.article, {
            title: "Related Article",
          }),
        ],
      }
      promisedMongoFetch.onFirstCall().resolves(articles)
      promisedMongoFetch.onSecondCall().resolves(relatedArticles)
      const results = await resolvers.relatedArticlesPanel({
        id: "54276766fd4f50996aeca2b8",
        tags: ["dog", "cat"],
        related_article_ids: ["54276766fd4f50996aeca2b1"],
      })
      results.length.should.equal(2)
      results[0].title.should.equal("Related Article")
      results[1].tags[0].should.equal("dog")
    })

    it("returns an error on the mongo fetch", async () => {
      promisedMongoFetch.onFirstCall().rejects()
      await resolvers
        .relatedArticlesPanel({
          id: "54276766fd4f50996aeca2b8",
          tags: ["dog", "cat"],
          related_article_ids: ["54276766fd4f50996aeca2b1"],
        })
        .catch(e => {
          e.message.should.containEql("Error")
        })
    })

    it("resolves null if there are no articles", async () => {
      promisedMongoFetch.onFirstCall().resolves({ results: [] })
      const result = await resolvers.relatedArticlesPanel({
        id: "54276766fd4f50996aeca2b8",
        tags: ["dog", "cat"],
      })
      _.isNull(result).should.be.true()
    })

    it("strips tags from args when the article does not have tags", async () => {
      promisedMongoFetch.onFirstCall().resolves(articles)
      await resolvers.relatedArticlesPanel({
        id: "54276766fd4f50996aeca2b8",
        tags: [],
      })
      Object.keys(promisedMongoFetch.args[0][0]).should.not.containEql("tags")
    })

    it("presents related_article_ids and feed articles", async () => {
      const relatedArticles = {
        results: [
          _.extend({}, fixtures.article, {
            title: "Related Article",
            slugs: ["artsy-editorial-slug"],
            updated_at: "2017-01-01",
          }),
        ],
      }
      promisedMongoFetch.onFirstCall().resolves(articles)
      promisedMongoFetch.onSecondCall().resolves(relatedArticles)
      const results = await resolvers.relatedArticlesPanel({
        id: "54276766fd4f50996aeca2b8",
        tags: ["dog", "cat"],
        related_article_ids: ["54276766fd4f50996aeca2b1"],
      })
      results.length.should.equal(2)
      results[0].slug.should.equal("artsy-editorial-slug")
      results[1].slug.should.equal("slug-1")
      results[0].updated_at.should.containEql("2017-01-01")
    })
  })

  describe("seriesArticle", () => {
    it("can find a series article", async () => {
      const seriesArticle = {
        results: [
          _.extend({}, fixtures.article, {
            title: "Series Article",
            related_article_ids: [ObjectId("54276766fd4f50996aeca2b8")],
          }),
        ],
      }
      promisedMongoFetch.onFirstCall().resolves(seriesArticle)
      const results = await resolvers.seriesArticle({
        id: "54276766fd4f50996aeca2b8",
      })
      results.title.should.equal("Series Article")
    })

    it("returns null if no series article is found", async () => {
      const seriesArticle = {
        results: [
          _.extend({}, fixtures.article, {
            title: "Series Article",
            related_article_ids: [],
          }),
        ],
      }
      promisedMongoFetch.onFirstCall().resolves(seriesArticle)
      const results = await resolvers.seriesArticle({
        id: "54276766fd4f50996aeca2b8",
      })
      _.isNull(results).should.be.true()
    })
  })

  describe("tags", () => {
    it("can find tags", async () => {
      const results = await resolvers.tags({}, {}, req, {})
      results.length.should.equal(1)
      results[0].name.should.equal("Show Reviews")
    })
  })
})

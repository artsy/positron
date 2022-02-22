import {
  SeriesArticle,
  StandardArticle,
} from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { ObjectId } from "mongodb"
import * as resolvers from "../resolvers"
const { fixtures } = require("api/test/helpers/db.coffee")

jest.mock("api/apps/articles/model/index.js", () => {
  // @ts-ignore
  const original = jest.requireActual("../../articles/model/index.js")
  return {
    promisedMongoFetch: jest.fn(),
    mongoFetch: jest.fn(),
    present: original.present,
    presentCollection: original.presentCollection,
    find: jest.fn(),
  }
})
const articleModel = require("../../articles/model/index.js")

jest.mock("api/apps/authors/model.coffee", () => ({
  mongoFetch: jest.fn(),
}))
const authorModel = require("api/apps/authors/model.coffee")

jest.mock("api/apps/channels/model.coffee", () => ({
  mongoFetch: jest.fn(),
  find: jest.fn(),
}))
const channelModel = require("api/apps/channels/model.coffee")

jest.mock("api/apps/curations/model.coffee", () => ({
  mongoFetch: jest.fn(),
}))
const curationModel = require("api/apps/curations/model.coffee")

jest.mock("api/apps/tags/model.coffee", () => ({
  mongoFetch: jest.fn(),
}))
const tagModel = require("api/apps/tags/model.coffee")

describe("resolvers", () => {
  const req = { user: { channel_ids: ["456"] } }
  let articleFixture
  let articlesFixture

  beforeEach(() => {
    articleFixture = {
      slugs: ["slug-1"],
      channel_id: "456",
      tags: ["dog"],
      vertical: { name: "Art Market", id: "54276766fd4f50996aeca2b3" },
      ...StandardArticle,
    }
    articlesFixture = {
      total: 20,
      count: 1,
      results: [articleFixture],
    }
    articleModel.mongoFetch.mockImplementation((_args, cb) => {
      cb(null, articlesFixture)
    })
    articleModel.promisedMongoFetch.mockResolvedValue(articlesFixture)
    articleModel.promisedMongoFetch.mockClear()
    articleModel.find.mockImplementation((_args, cb) => {
      cb(null, {
        ...articleFixture,
      })
    })
  })

  describe("articles", () => {
    it("throws error when requesting a draft without channel_id", () => {
      const args = { published: false }
      expect(() => resolvers.articles({}, args, {}, {})).toThrow(
        "Must pass channel_id to view unpublished articles. Or pass published: true to only view published articles."
      )
    })

    it("returns throws an error when trying to view an unauthorized draft", () => {
      const args = { published: false, channel_id: "123" }
      expect(() => resolvers.articles({}, args, {}, {})).toThrow(
        "Must be a member of this channel to view unpublished articles. Pass published: true to only view published articles."
      )
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
    const args: any = { id: "123" }

    it("rejects with an error when no article is found", async () => {
      articleModel.find.mockImplementationOnce((_args, cb) => {
        cb(null, null)
      })
      try {
        await resolvers.article({}, args, {}, {})
      } catch (err) {
        err.toString().should.containEql("Article not found.")
      }
    })

    it("rejects with an error when trying to view an unauthorized draft", async () => {
      articleModel.find.mockImplementationOnce((_args, cb) => {
        cb(null, {
          published: false,
          ...articleFixture,
        })
      })
      try {
        await resolvers.article({}, args, {}, {})
      } catch (err) {
        err.toString().should.containEql("Must be a member of the channel")
      }
    })

    it("can view drafts", async () => {
      args.channel_id = "456"
      articleModel.find.mockImplementationOnce((_args, cb) => {
        cb(null, {
          published: false,
          ...articleFixture,
        })
      })
      const results = await resolvers.article({}, args, req, {})
      results.slug.should.equal("slug-1")
    })

    it("can view published articles", async () => {
      const results = await resolvers.article({}, args, req, {})
      results.slug.should.equal("slug-1")
    })
  })

  describe("authors", () => {
    beforeEach(() => {
      authorModel.mongoFetch.mockImplementation((_args, cb) => {
        cb(null, { total: 20, count: 1, results: [fixtures().authors] })
      })
    })

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
    let root: any = { author_ids: [{ id: "123" }] }

    it("can find authors", async () => {
      const results = await resolvers.relatedAuthors(root)
      results.length.should.equal(1)
      results[0].name.should.equal("Halley Johnson")
      results[0].bio.should.equal("Writer based in NYC")
      results[0].twitter_handle.should.equal("kanaabe")
      results[0].image_url.should.equal("https://artsy-media.net/halley.jpg")
    })

    it("returns null if there are no authors from fetch", async () => {
      authorModel.mongoFetch.mockImplementationOnce((_args, cb) => {
        cb(null, { total: 20, count: 1, results: [] })
      })
      const results = await resolvers.relatedAuthors(root)
      expect(results).toBeNull()
    })

    it("returns null if the article has no author_ids", async () => {
      root = { author_ids: null }
      const results = await resolvers.relatedAuthors(root)
      expect(results).toBeNull()
    })
  })

  describe("channels", () => {
    it("can find channels", async () => {
      channelModel.mongoFetch.mockImplementation((_args, cb) => {
        cb(null, { total: 20, count: 1, results: [fixtures().channels] })
      })
      const results = await resolvers.channels(articleFixture, {}, req, {})
      results.length.should.equal(1)
      results[0].name.should.equal("Editorial")
      results[0].type.should.equal("editorial")
    })
  })

  describe("articleChannel", () => {
    it("can return article channel", async () => {
      channelModel.find.mockImplementation((_args, cb) => {
        cb(null, fixtures().channels)
      })
      const results = await resolvers.articleChannel(
        articleFixture,
        // @ts-ignore
        {},
        req,
        {}
      )
      results.name.should.equal("Editorial")
      results.type.should.equal("editorial")
    })
  })

  describe("curations", () => {
    it("can find curations", async () => {
      curationModel.mongoFetch.mockImplementation((_args, cb) => {
        cb(null, { total: 20, count: 1, results: [fixtures().curations] })
      })
      const results = await resolvers.curations({}, {}, req, {})
      results.length.should.equal(1)
      results[0].name.should.equal("Featured Articles")
    })
  })

  describe("seriesArticle", () => {
    it("can find a series article", async () => {
      articleModel.promisedMongoFetch.mockResolvedValueOnce({
        results: [SeriesArticle],
      })
      const results = await resolvers.seriesArticle({
        id: SeriesArticle.id,
      })
      results.title.should.equal("The Future of Art")
    })

    it("returns null if no series article is found", async () => {
      articleModel.promisedMongoFetch.mockResolvedValueOnce({
        results: [
          {
            related_article_ids: [],
            ...SeriesArticle,
          },
        ],
      })
      const results = await resolvers.seriesArticle({
        id: "123",
      })
      expect(results).toBeNull()
    })
  })

  describe("tags", () => {
    it("can find tags", async () => {
      tagModel.mongoFetch.mockImplementation((_args, cb) => {
        cb(null, { total: 20, count: 1, results: [fixtures().tags] })
      })
      const results = await resolvers.tags({}, {}, req, {})
      results.length.should.equal(1)
      results[0].name.should.equal("Show Reviews")
    })
  })

  describe("relatedArticles", () => {
    it("can find related articles for the series", async () => {
      articleModel.promisedMongoFetch.mockResolvedValueOnce({
        results: [SeriesArticle],
      })
      const results = await resolvers.relatedArticles(
        {
          id: SeriesArticle.id,
          related_article_ids: ["594a7e2254c37f00177c0ea9"],
        },
        {},
        { user: { id: "123" } }
      )
      results.length.should.equal(1)
      results[0].id.should.equal("594a7e2254c37f00177c0ea9")
    })

    it("preserves sort order of related articles", async () => {
      const related1 = {
        ...SeriesArticle,
        _id: "594a7e2254c37f00177c0ea9",
        id: "594a7e2254c37f00177c0ea9",
        related_article_ids: [],
      }
      const related2 = {
        ...SeriesArticle,
        _id: "597b9f652d35b80017a2a6a7",
        id: "597b9f652d35b80017a2a6a7",
        related_article_ids: [],
      }
      articleModel.promisedMongoFetch.mockResolvedValueOnce({
        results: [related2, related1],
      })
      const results = await resolvers.relatedArticles(
        SeriesArticle,
        {},
        { user: { id: "123" } }
      )
      results[0].id.should.equal(related1.id)
      results[1].id.should.equal(related2.id)
    })

    it("resolves null if it does not have related articles", async () => {
      articleModel.promisedMongoFetch.mockResolvedValueOnce({ results: [] })
      const results = await resolvers.relatedArticles(
        {
          id: "54276766fd4f50996aeca2b8",
        },
        {},
        { user: { id: "123" } }
      )
      expect(results).toBeNull()
    })

    it("queries only published articles if user is unauthorized", async () => {
      articleModel.promisedMongoFetch.mockResolvedValueOnce({ results: [] })
      await resolvers.relatedArticles(
        {
          id: "54276766fd4f50996aeca2b8",
          related_article_ids: ["54276766fd4f50996aeca2b9"],
          channel_id: "54276766fd4f50996aeca2b3",
        },
        {},
        { user: { id: "123" } }
      )
      expect(articleModel.promisedMongoFetch.mock.calls[0][0].published).toBe(
        true
      )
    })

    it("queries all articles if user is authorized", async () => {
      articleModel.promisedMongoFetch.mockResolvedValueOnce({ results: [] })
      await resolvers.relatedArticles(
        {
          id: "54276766fd4f50996aeca2b8",
          related_article_ids: ["54276766fd4f50996aeca2b9"],
          channel_id: "54276766fd4f50996aeca2b3",
        },
        {},
        { user: { id: "123", channel_ids: ["54276766fd4f50996aeca2b3"] } }
      )
      expect(
        articleModel.promisedMongoFetch.mock.calls[0][0].published
      ).toBeUndefined()
    })

    it("Sets limit arg to the number of articles to be fetched", async () => {
      await resolvers.relatedArticles(
        {
          id: "54276766fd4f50996aeca2b8",
          related_article_ids: [
            "5d41a53f3eba8dbdd43f3537",
            "5d51ad9c0240500023579175",
            "5d51af002e1f0b002280551c",
            "5d51af462e1f0b0022805553",
            "5d51afd70240500023579224",
            "5d51b03a2e1f0b00228055bf",
            "5d51b0a0024050002357926e",
            "5d51b03a0240500023579240",
            "5d51b13302405000235792ab",
            "5d51b13302405000235792ac",
            "5d51b1ae2e1f0b002280566e",
          ],
          channel_id: "54276766fd4f50996aeca2b3",
        },
        {},
        { user: { id: "123", channel_ids: ["54276766fd4f50996aeca2b3"] } }
      )
      expect(articleModel.promisedMongoFetch.mock.calls[0][0].limit).toBe(11)
    })
  })

  describe("relatedArticlesCanvas", () => {
    xit("can find related articles for the canvas", async () => {
      // articleModel.promisedMongoFetch.mockResolvedValueOnce(articlesFixture)
      const results = await resolvers.relatedArticlesCanvas({
        id: "54276766fd4f50996aeca2b8",
        vertical: { id: "54276766fd4f50996aeca2b3" },
      })
      results.length.should.equal(1)
      results[0].vertical.id.should.equal("54276766fd4f50996aeca2b3")
    })

    it("resolves null if it does not have articles", async () => {
      articleModel.promisedMongoFetch.mockResolvedValueOnce({ results: [] })
      const results = await resolvers.relatedArticlesCanvas({
        id: "54276766fd4f50996aeca2b8",
        vertical: { id: "54276766fd4f50996aeca2b3" },
      })
      expect(results).toBeNull()
    })

    it("omits related articles and root article from fetch", async () => {
      articleFixture.id = "594a7e2254c37f00177c0ea9"
      articleFixture.related_article_ids = [
        ObjectId("5c40890f521d075876214805"),
        ObjectId("5c472ea015f1e22de4eef4b0"),
      ]
      articleFixture.vertical.id = "54276766fd4f50996aeca2b3"
      articleFixture.channel_id = "f78859586db1ce9913107e1b"
      await resolvers.relatedArticlesCanvas(articleFixture)
      const args = articleModel.promisedMongoFetch.mock.calls[0][0]

      args.omit.length.should.equal(3)
      expect(args.omit[0]).toMatchObject(ObjectId("594a7e2254c37f00177c0ea9"))
      expect(args.omit[1]).toMatchObject(ObjectId("5c40890f521d075876214805"))
      expect(args.omit[2]).toMatchObject(ObjectId("5c472ea015f1e22de4eef4b0"))
    })

    it("makes fetch with relatedArticleArgs", async () => {
      articleFixture.id = "594a7e2254c37f00177c0ea9"
      articleFixture.related_article_ids = [
        ObjectId("5c40890f521d075876214805"),
        ObjectId("5c472ea015f1e22de4eef4b0"),
      ]
      articleFixture.channel_id = "f78859586db1ce9913107e1b"
      await resolvers.relatedArticlesCanvas(articleFixture)
      expect(articleModel.promisedMongoFetch).toHaveBeenCalledTimes(2)
      expect(articleModel.promisedMongoFetch).toHaveBeenCalledWith({
        ids: articleFixture.related_article_ids,
        limit: 4,
        published: true,
        has_published_media: true,
      })
    })
  })

  describe("relatedArticlesPanel", () => {
    it("can find related articles for the panel without related_article_ids", async () => {
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
          {
            title: "Related Article",
            ...articlesFixture,
          },
        ],
      }
      articleModel.promisedMongoFetch.mockResolvedValueOnce(articlesFixture)
      articleModel.promisedMongoFetch.mockResolvedValueOnce(relatedArticles)
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
      articleModel.promisedMongoFetch.mockRejectedValueOnce({
        message: "Error",
      })
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
      articleModel.promisedMongoFetch.mockResolvedValueOnce({ results: [] })
      const result = await resolvers.relatedArticlesPanel({
        id: "54276766fd4f50996aeca2b8",
        tags: ["dog", "cat"],
      })
      expect(result).toBeNull()
    })

    it("strips tags from args when the article does not have tags", async () => {
      await resolvers.relatedArticlesPanel({
        id: "54276766fd4f50996aeca2b8",
        tags: [],
      })
      Object.keys(
        articleModel.promisedMongoFetch.mock.calls[0][0]
        // @ts-ignore
      ).should.not.containEql("tags")
    })

    it("presents related_article_ids and feed articles", async () => {
      const relatedArticles = {
        results: [
          {
            title: "Related Article",
            slugs: ["artsy-editorial-slug"],
            updated_at: "2017-01-01",
          },
        ],
      }
      articleModel.promisedMongoFetch.mockResolvedValueOnce(articlesFixture)
      articleModel.promisedMongoFetch.mockResolvedValueOnce(relatedArticles)
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

    it("omits related articles and root article from fetch", async () => {
      articleFixture.id = "594a7e2254c37f00177c0ea9"
      articleFixture.related_article_ids = [
        ObjectId("5c40890f521d075876214805"),
        ObjectId("5c472ea015f1e22de4eef4b0"),
      ]
      articleFixture.channel_id = "f78859586db1ce9913107e1b"
      await resolvers.relatedArticlesPanel(articleFixture)
      const args = articleModel.promisedMongoFetch.mock.calls[0][0]

      args.omit.length.should.equal(3)
      expect(args.omit[0]).toMatchObject(ObjectId("594a7e2254c37f00177c0ea9"))
      expect(args.omit[1]).toMatchObject(ObjectId("5c40890f521d075876214805"))
      expect(args.omit[2]).toMatchObject(ObjectId("5c472ea015f1e22de4eef4b0"))
    })

    it("makes fetch with relatedArticleargs", async () => {
      articleFixture.related_article_ids = [
        ObjectId("5c40890f521d075876214805"),
        ObjectId("5c472ea015f1e22de4eef4b0"),
      ]
      articleFixture.channel_id = "f78859586db1ce9913107e1b"
      await resolvers.relatedArticlesCanvas(articleFixture)
      expect(articleModel.promisedMongoFetch).toHaveBeenCalledTimes(2)
      expect(articleModel.promisedMongoFetch).toHaveBeenCalledWith({
        ids: articleFixture.related_article_ids,
        limit: 4,
        published: true,
        has_published_media: true,
      })
    })
  })
})

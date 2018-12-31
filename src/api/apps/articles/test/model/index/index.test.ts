import moment from "moment"
// import gravity from "antigravity"
// import express from "express"
import { ObjectId } from "mongojs"
import _ from "underscore"

import search from "../../../../../lib/elasticsearch"
import { db, empty, fabricate, fixtures } from "../../../../../test/helpers/db"
import {
  destroy,
  getSuperArticleCount,
  present,
  presentCollection,
  promisedMongoFetch,
  publishScheduledArticles,
  unqueue,
} from "../../../model"

describe("Article", () => {
  // TODO: Do we really need this test set up?
  // let app
  // let server
  //
  // beforeEach(done => {
  //   app = express()
  //   // app.use("/__gravity", gravity.server)
  //
  //   server = app.listen(5000, () =>
  //     search.client.indices.create(
  //       { index: `articles_${process.env.NODE_ENV}` },
  //       () => done()
  //     )
  //   )
  // })
  //
  // afterEach(() => {
  //   server.close()
  //
  //   search.client.indices.delete({ index: `articles_${process.env.NODE_ENV}` })
  // })

  beforeEach(done => {
    // @deleteArticleFromSailthru = sinon.stub().yields()
    // __set__ 'deleteArticleFromSailthru', @deleteArticleFromSailthru

    empty(() => fabricate("articles", _.times(10, () => ({})), () => done()))
  })

  describe("#publishScheduledArticles", () => {
    it("calls #save on each article that needs to be published", done => {
      fabricate(
        "articles",
        {
          _id: ObjectId("54276766fd4f50996aeca2b8"),
          author_id: ObjectId("5086df098523e60002000018"),
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
        () => {
          publishScheduledArticles((_err, results) => {
            expect(results[0].published).toBe(true)
            expect(results[0].published_at.toString()).toEqual(
              moment("2016-01-01")
                .toDate()
                .toString()
            )
            expect(results[0].sections[0].body).toContain(
              "The start of a new article"
            )
            expect(results[0].sections[1].images[0].url).toContain(
              "https://image.png"
            )

            done()
          })
        }
      )
    })
  })

  describe("#unqueue", () => {
    it("calls #save on each article that needs to be unqueued", done => {
      fabricate(
        "articles",
        {
          _id: ObjectId("54276766fd4f50996aeca2b8"),
          weekly_email: true,
          daily_email: true,
          author: {
            name: "Kana Abe",
          },
          sections: [],
        },
        () => {
          unqueue((_err, results) => {
            expect(results[0].weekly_email).toBe(false)
            expect(results[0].daily_email).toBe(false)
            done()
          })
        }
      )
    })
  })

  describe("#destroy", () => {
    it("removes an article", done => {
      fabricate(
        "articles",
        { _id: ObjectId("5086df098523e60002000018") },
        () => {
          destroy("5086df098523e60002000018", () =>
            db.articles.count((_err, count) => {
              expect(count).toEqual(10)
              done()
            })
          )
        }
      )
    })

    it("returns an error message", done => {
      destroy("5086df098523e60002000019", err => {
        expect(err.message).toEqual("Article not found.")
        done()
      })
    })

    it("removes the article from elasticsearch", () => {
      fabricate(
        "articles",
        { _id: ObjectId("5086df098523e60002000019"), title: "quux" },
        () =>
          setTimeout(() => {
            destroy("5086df098523e60002000019", () => {
              setTimeout(() => {
                search.client.search(
                  {
                    index: search.index,
                    q: "title:quux",
                  },
                  (_error, response) => {
                    // console.log(_error, response)
                    expect(response.hits.hits.length).toEqual(0)
                  }
                )
              }, 1000)
            })
          }, 1000)
      )
    })
  })

  describe("#present", () => {
    it("adds both _id and id", () => {
      const result = present(_.extend({}, fixtures().articles, { _id: "foo" }))

      expect(result.id).toEqual("foo")
      expect(result._id).toEqual("foo")
    })

    it("converts dates to ISO strings", () => {
      const result = present(
        _.extend({}, fixtures().articles, {
          published_at: new Date(),
          scheduled_publish_at: new Date(),
        })
      )

      expect(moment(result.updated_at).toISOString()).toEqual(result.updated_at)
      expect(moment(result.published_at).toISOString()).toEqual(
        result.published_at
      )
      expect(moment(result.scheduled_publish_at).toISOString()).toEqual(
        result.scheduled_publish_at
      )
    })
  })

  describe("#presentCollection", () => {
    it("shows a total/count/results hash for arrays of articles", () => {
      const result = presentCollection({
        total: 10,
        count: 1,
        results: [_.extend({}, fixtures().articles, { _id: "baz" })],
      })

      expect(result.results[0].id).toEqual("baz")
    })
  })

  describe("#getSuperArticleCount", () => {
    it("returns 0 if the id is invalid", async () => {
      const id = "123"

      const count = await getSuperArticleCount(id)
      expect(count).toEqual(0)
    })

    it("returns a count of super articles that have the given id as a related article", async () => {
      fabricate(
        "articles",
        {
          _id: ObjectId("54276766fd4f50996aeca2b8"),
          super_article: {
            related_articles: [ObjectId("5086df098523e60002000018")],
          },
        },
        () => null
      )
      const id = "5086df098523e60002000018"

      const count = await getSuperArticleCount(id)
      expect(count).toEqual(1)
    })
  })

  describe("#promisedMongoFetch", () => {
    it("returns results, counts, and totals", done => {
      fabricate(
        "articles",
        { _id: ObjectId("5086df098523e60002000018") },
        async () => {
          const { count, total, results } = await promisedMongoFetch({
            count: true,
            ids: [ObjectId("5086df098523e60002000018")],
          })

          expect(count).toEqual(1)
          expect(total).toEqual(11)
          expect(results.length).toEqual(1)
          done()
        }
      )
    })
  })
})

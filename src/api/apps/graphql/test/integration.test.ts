/**
 * @jest-environment node
 */

import {
  ArticleSectionsQuery,
  RelatedArticlesCanvasQuery,
  RelatedArticlesQuery,
} from "api/apps/graphql/test/queries"
import request from "superagent"
const { ObjectId } = require("mongodb-legacy")
const app = require("../../../index.coffee")
const {
  fabricate,
  fixtures,
  empty,
} = require("../../../test/helpers/db.coffee")

describe("graphql endpoint", () => {
  let server

  beforeAll(done => {
    server = app.listen(5001, () => {
      done()
    })
  })

  afterAll(() => {
    server.close()
  })

  beforeEach(done => {
    empty(() => {
      fabricate(
        "authors",
        [{ _id: new ObjectId("55356a9deca560a0137bb4ae"), name: "Kana" }],
        (err, _res) => {
          if (err) {
            done(err.message)
          }
          fabricate(
            "articles",
            [
              fixtures.articles,
              { published: false, ...fixtures.articles },
              {
                title: "Top Eleven Booths",
                published: true,
                _id: new ObjectId("5c9d3c1aa4ba105ad8336956"),
                author_ids: [new ObjectId("55356a9deca560a0137bb4ae")],
                channel_id: new ObjectId("5aa99c11da4c00d6bc33a816"),
              },
              {
                title: "Top Twelve Booths",
                _id: new ObjectId("5f32e33bd273fe3b7f0e3f00"),
                published: true,
                featured: true,
                vertical: {
                  name: "Culture",
                  id: new ObjectId("55356a9deca560a0137bb4a7"),
                },
                layout: "series",
                channel_id: new ObjectId("5aa99c11da4c00d6bc33a816"),
                author_ids: [new ObjectId("55356a9deca560a0137bb4ae")],
                related_article_ids: [new ObjectId("5c9d3c1aa4ba105ad8336956")],
              },
            ],
            () => {
              done()
            }
          )
        }
      )
    })
  })

  it("can get a list of published articles", done => {
    const query = `
        {
          articles(published: true) {
            title
          }
        }
      `
    request
      .post("http://localhost:5001/graphql")
      .send({ query })
      .end((err, { body: { data: { articles } } }) => {
        if (err) {
          done(err.message)
        }
        expect(articles.length).toBe(3)
        expect(articles[0].title).toEqual("Top Twelve Booths")
        expect(articles[1].title).toEqual("Top Eleven Booths")
        expect(articles[2].title).toEqual("Top Ten Booths")
        done()
      })
  })

  it("can get sections in an article", done => {
    request
      .post("http://localhost:5001/graphql")
      .send({ query: ArticleSectionsQuery })
      .end((err, { body: { data: { articles } } }) => {
        if (err) {
          done(err.message)
        }
        expect(articles[0].sections[1].type).toEqual("image_collection")
        expect(articles[0].sections[2].type).toEqual("text")
        expect(articles[0].sections[2].body).toContain("10. Lisson Gallery")
        expect(articles[0].sections[5].type).toEqual("video")
        expect(articles[0].sections[5].url).toEqual(
          "http://youtu.be/yYjLrJRuMnY"
        )
        done()
      })
  })

  it("can get authors in relatedArticles", done => {
    request
      .post("http://localhost:5001/graphql")
      .send({ query: RelatedArticlesQuery })
      .end((err, { body: { data: { articles } } }) => {
        if (err) {
          done(err.message)
        }
        expect(articles.length).toEqual(3)
        expect(articles[0].relatedArticles[0].title).toEqual(
          "Top Eleven Booths"
        )
        expect(articles[0].relatedArticles[0].authors[0].name).toEqual("Kana")
        done()
      })
  })

  it("can get seriesArticle in relatedArticles", done => {
    request
      .post("http://localhost:5001/graphql")
      .send({ query: RelatedArticlesQuery })
      .end((err, { body: { data: { articles } } }) => {
        if (err) {
          done(err.message)
        }
        expect(articles[0].relatedArticles[0].title).toEqual(
          "Top Eleven Booths"
        )
        expect(articles[0].relatedArticles[0].seriesArticle.id).toEqual(
          "5f32e33bd273fe3b7f0e3f00"
        )
        done()
      })
  })

  it("can get authors in relatedArticlesCanvas", done => {
    request
      .post("http://localhost:5001/graphql")
      .send({ query: RelatedArticlesCanvasQuery })
      .end((err, { body: { data: { articles } } }) => {
        if (err) {
          done(err.message)
        }
        expect(articles.length).toEqual(3)
        expect(articles[1].relatedArticlesCanvas[0].title).toEqual(
          "Top Twelve Booths"
        )
        expect(articles[1].relatedArticlesCanvas[0].authors[0].name).toEqual(
          "Kana"
        )
        done()
      })
  })
})

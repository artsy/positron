import request from "superagent"
import {
  ArticleSectionsQuery,
  RelatedArticlesQuery,
  RelatedArticlesCanvasQuery,
} from "api/apps/graphql/test/queries"
const { ObjectId } = require("mongojs")
const app = require("../../../index.coffee")
const {
  fabricate,
  fixtures,
  empty,
} = require("../../../test/helpers/db.coffee")

describe("graphql endpoint", () => {
  let server

  before(done => {
    server = app.listen(5000, () => {
      done()
    })
  })

  beforeEach((done) => {
    empty(() => {
      fabricate(
        "authors",
        [{ _id: ObjectId("55356a9deca560a0137bb4ae"), name: "Kana" }],
        (err, res) => {
          if (err) { console.warn(err.message) }
        fabricate("articles", [
          fixtures.articles,
          { published: false, ...fixtures.articles },
            {
              title: "Top Eleven Booths",
              published: true,
              _id: ObjectId("5c9d3c1aa4ba105ad8336956"),
              author_ids: [ObjectId("55356a9deca560a0137bb4ae")],
              channel_id: ObjectId("5aa99c11da4c00d6bc33a816"),
            },
            {
              title: "Top Twelve Booths",
              _id: ObjectId("5f32e33bd273fe3b7f0e3f00"),
              published: true,
              featured: true,
              vertical: {
                name: "Culture",
                id: ObjectId("55356a9deca560a0137bb4a7"),
              },
              layout: "series",
              channel_id: ObjectId("5aa99c11da4c00d6bc33a816"),
              author_ids: [ObjectId("55356a9deca560a0137bb4ae")],
              related_article_ids: [ObjectId("5c9d3c1aa4ba105ad8336956")],
            },
        ], () => {
          done()
        })
      })
    })
  })

  after(() => {
    server.close()
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
        .post("http://localhost:5000/graphql")
        .send({ query })
        .end((err, {body: { data: { articles } }}) => {
          if (err) { console.warn(err.message) }
          articles.length.should.equal(3)
          articles[0].title.should.equal("Top Twelve Booths")
          articles[1].title.should.equal("Top Eleven Booths")
          articles[2].title.should.equal("Top Ten Booths")
          done()
        })
      })

  it("can get sections in an article", done => {
      request
        .post("http://localhost:5000/graphql")
        .send({ query: ArticleSectionsQuery })
        .end((err, {body: { data: { articles } }}) => {
          if (err) { console.warn(err.message) }
          articles[0].sections[1].type.should.equal(
            "image_collection"
          )
          articles[0].sections[2].type.should.equal("text")
          articles[0].sections[2].body.should.containEql(
            "10. Lisson Gallery"
          )
          articles[0].sections[5].type.should.equal("video")
          articles[0].sections[5].url.should.equal(
            "http://youtu.be/yYjLrJRuMnY"
          )
          done()
        })
  })

  it("can get authors in relatedArticles", done => {
    request
      .post("http://localhost:5000/graphql")
      .send({ query: RelatedArticlesQuery })
      .end((err, {body: { data: { articles } }}) => {
        if (err) { console.warn(err.message) }
        articles.length.should.equal(3)
        articles[0].relatedArticles[0].title.should.equal(
          "Top Eleven Booths"
        )
        articles[0].relatedArticles[0].authors[0].name.should.equal(
          "Kana"
        )
        done()
      })
    })

  it("can get seriesArticle in relatedArticles", done => {
      request
        .post("http://localhost:5000/graphql")
        .send({ query: RelatedArticlesQuery })
        .end((err, {body: { data: { articles } }}) => {
          if (err) { console.warn(err.message) }
          articles[0].relatedArticles[0].title.should.equal(
            "Top Eleven Booths"
          )
          articles[0].relatedArticles[0].seriesArticle.id.should.equal(
            "5f32e33bd273fe3b7f0e3f00"
          )
          done()
        })
      })

  it("can get authors in relatedArticlesCanvas", done => {
      request
        .post("http://localhost:5000/graphql")
        .send({ query: RelatedArticlesCanvasQuery })
        .end((err, {body: { data: { articles } }}) => {
          if (err) { console.warn(err.message) }
          articles.length.should.equal(3)
          articles[1].relatedArticlesCanvas[0].title.should.equal(
            "Top Twelve Booths"
          )
          articles[1].relatedArticlesCanvas[0].authors[0].name.should.equal(
            "Kana"
          )
          done()
        })
      })
    })

import request from "superagent"
import {
  ArticleSectionsQuery,
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

  beforeEach(done => {
    empty(() => {
      server = app.listen(5000, () => {
        done()
      })
    })
  })

  afterEach(() => {
    server.close()
  })

  it("can get a list of published articles", done => {
    fabricate(
      "articles",
      [
        { title: "Flowers on Flowers", published: true },
        { title: "Plants on Plants", published: true },
      ],
      (err, articles) => {
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
          .end((err, res) => {
            res.body.data.articles.length.should.equal(2)
            res.body.data.articles[0].title.should.equal("Plants on Plants")
            res.body.data.articles[1].title.should.equal("Flowers on Flowers")
            done()
          })
      }
    )
  })

  it("can get sections in an article", done => {
    fabricate("articles", [fixtures.articles], (err, articles) => {
      request
        .post("http://localhost:5000/graphql")
        .send({ query: ArticleSectionsQuery })
        .end((err, res) => {
          res.body.data.articles.length.should.equal(1)
          res.body.data.articles[0].sections[1].type.should.equal(
            "image_collection"
          )
          res.body.data.articles[0].sections[2].type.should.equal("text")
          res.body.data.articles[0].sections[2].body.should.containEql(
            "10. Lisson Gallery"
          )
          res.body.data.articles[0].sections[5].type.should.equal("video")
          res.body.data.articles[0].sections[5].url.should.equal(
            "http://youtu.be/yYjLrJRuMnY"
          )
          done()
        })
    })
  })

  it("can get authors in relatedArticlesCanvas", done => {
    fabricate(
      "authors",
      [{ _id: ObjectId("55356a9deca560a0137bb4ae"), name: "Kana" }],
      (err, articles) => {
        fabricate(
          "articles",
          [
            fixtures.articles,
            {
              published: true,
              featured: true,
              vertical: {
                name: "Culture",
                id: ObjectId("55356a9deca560a0137bb4a7"),
              },
              channel_id: ObjectId("5aa99c11da4c00d6bc33a816"),
              author_ids: [ObjectId("55356a9deca560a0137bb4ae")],
            },
          ],
          (err, articles) => {
            request
              .post("http://localhost:5000/graphql")
              .send({ query: RelatedArticlesCanvasQuery })
              .end((err, res) => {
                res.body.data.articles.length.should.equal(2)
                res.body.data.articles[1].relatedArticlesCanvas[0].title.should.equal(
                  "Top Ten Booths"
                )
                res.body.data.articles[1].relatedArticlesCanvas[0].authors[0].name.should.equal(
                  "Kana"
                )
                done()
              })
          }
        )
      }
    )
  })
})

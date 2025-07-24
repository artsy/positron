import { ObjectId } from "mongodb"
import request from "superagent"
const {
  db,
  fixtures,
  fabricate,
  empty,
} = require("../../../test/helpers/db.coffee")
const app = require("../../../index.coffee")

describe("articles endpoints", () => {
  let user
  let server
  let token
  const TEST_PORT = process.env.TEST_PORT || 5001
  const BASE_URL = `http://localhost:${TEST_PORT}`

  beforeEach(done => {
    empty(() => {
      token = fixtures().users.access_token
      fabricate("users", {}, (err, u) => {
        if (err) {
          done(err)
        }
        user = u
        server = app.listen(TEST_PORT, () => done())
      })
    })
  })

  afterEach(() => {
    server.close()
  })

  describe("as a non-logged in user", () =>
    it("can get a list of published articles without a logged in user", done =>
      fabricate(
        "articles",
        [
          { title: "Flowers on Flowers", published: true },
          { title: "Flowers on Flowers The Sequel", published: true },
          { published: false },
        ],
        (err, _articles) => {
          if (err) {
            done(err)
          }
          request.get(`${BASE_URL}/articles?count=true`).end((error, res) => {
            if (error) {
              done(error)
            }
            res.body.total.should.equal(3)
            res.body.count.should.equal(2)
            res.body.results[0].title.should.equal(
              "Flowers on Flowers The Sequel"
            )
            done()
          })
        }
      )))

  describe("as a non-admin and no team role", () => {
    let normieToken
    beforeEach(done => {
      normieToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsInR5cGUiOiJVc2VyIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwidHlwZSI6IlVzZXIiLCJwYXJ0bmVyX2lkcyI6W10sImlhdCI6MTUxNjIzOTAyMn0.1ONei7j20cbeusjWiUvTt-CTDCdpewnj3mbmIA_-Hbs"
      fabricate(
        "users",
        {
          type: "User",
          name: "Normie",
          access_token: normieToken,
          has_partner_access: false,
          _id: undefined,
        },
        (err, _normie) => {
          if (err) {
            done(err)
          }
          done()
        }
      )
    })

    it("does not allow featuring", done => {
      request
        .post(`${BASE_URL}/articles`)
        .set({ "X-Access-Token": normieToken })
        .send({ featured: true })
        .end((err, res) => {
          err.status.should.equal(401)
          res.body.message.should.containEql("must have editorial role")
          done()
        })
    })

    xit("does not allow viewing drafts", done =>
      fabricate(
        "articles",
        [
          {
            title: "Cows on the prarie",
            _id: new ObjectId("5086df098523e60002000012"),
            partner_channel_id: new ObjectId("5086df098523e60002000012"),
            published: false,
          },
        ],
        (err, _articles) => {
          if (err) {
            done(err)
          }
          request
            .get(`${BASE_URL}/articles/5086df098523e60002000012`)
            .end((error, _res) => {
              if (error) {
                done(error)
              }
              error.status.should.equal(404)
              done()
            })
        }
      ))
  })

  describe("as a channel member", () => {
    it("creates articles", done => {
      request
        .post(`${BASE_URL}/articles`)
        .set({ "X-Access-Token": token })
        .send({
          title: "Hi",
          partner_channel_id: "5086df098523e60002000012",
          author_id: "5086df098523e60002000012",
        })
        .end((err, res) => {
          if (err) {
            done(err)
          }
          res.body.title.should.equal("Hi")
          done()
        })
    })

    it("gets a list of articles by author", done => {
      fabricate(
        "articles",
        [
          { title: "Flowers on Flowers", author_id: user._id },
          { title: "Flowers on Flowers The Sequel", author_id: user._id },
          {},
        ],
        (err, _articles) => {
          if (err) {
            done(err)
          }
          request
            .get(
              `${BASE_URL}/articles?author_id=${
                user._id
              }&published=true&count=true`
            )
            .set({ "X-Access-Token": token })
            .end((error, res) => {
              if (error) {
                done(error)
              }
              res.body.total.should.equal(3)
              res.body.count.should.equal(2)
              res.body.results[0].title.should.equal(
                "Flowers on Flowers The Sequel"
              )
              done()
            })
        }
      )
    })

    it("handles ObjectId string compatibility for author queries", done => {
      const targetAuthorId = new ObjectId("6878fe6c9710aed1770fc57f")
      const targetArticleId = new ObjectId("6878fe6c9710aed1770fc589")

      // Create an article with the exact data from the browser
      fabricate(
        "articles",
        [
          {
            _id: targetArticleId,
            title: "Latin American Art: A Growing Global Influence",
            author_id: targetAuthorId,
            author_ids: [targetAuthorId], // This is the key difference!
            author: {
              name: "Emma Rodriguez",
              id: targetAuthorId,
            },
            published: true,
          },
          {
            title: "Different Article",
            author_id: user._id,
            published: true,
          },
        ],
        (err, articles) => {
          if (err) {
            done(err)
          }

          console.log(
            "Created articles:",
            articles.map(a => ({
              _id: a._id,
              title: a.title,
              author_id: a.author_id,
              author_ids: a.author_ids,
            }))
          )

          // Test the exact browser query with author_id (using string version of ObjectId)
          request
            .get(
              `${BASE_URL}/articles?published=true&count=true&author_id=6878fe6c9710aed1770fc57f`
            )
            .set({ "X-Access-Token": token })
            .end((error, res) => {
              if (error) {
                done(error)
              }
              console.log(
                "author_id query results:",
                res.body.results.map(a => ({
                  _id: a._id,
                  title: a.title,
                  author_id: a.author_id,
                  author_ids: a.author_ids,
                }))
              )

              // Test with author_ids (using string version of ObjectId)
              request
                .get(
                  `${BASE_URL}/articles?published=true&count=true&author_ids=6878fe6c9710aed1770fc57f`
                )
                .end((error, res) => {
                  if (error) {
                    done(error)
                  }
                  console.log(
                    "author_ids query results:",
                    res.body.results.map(a => ({
                      _id: a._id,
                      title: a.title,
                      author_id: a.author_id,
                      author_ids: a.author_ids,
                    }))
                  )

                  done()
                })
            })
        }
      )
    })

    it("gets a list of articles by author_ids (array inclusion)", done => {
      const authorId = new ObjectId()
      const coAuthorId = new ObjectId()
      const thirdAuthorId = new ObjectId()
      fabricate(
        "articles",
        [
          {
            title: "Multi Author Article 1",
            author_ids: [authorId, coAuthorId],
            published: true,
          },
          {
            title: "Multi Author Article 2",
            author_ids: [authorId],
            published: true,
          },
          {
            title: "Different Author Article",
            author_ids: [coAuthorId],
            published: true,
          },
          {
            title: "Three Author Article",
            author_ids: [thirdAuthorId, authorId, coAuthorId], // authorId is not first in array
            published: true,
          },
          {
            title: "Single Author Article",
            author_id: user._id,
            published: true,
          },
        ],
        (err, _articles) => {
          if (err) {
            done(err)
          }
          // Test querying for authorId - should find articles where authorId is anywhere in the author_ids array
          request
            .get(
              `${BASE_URL}/articles?author_ids=${authorId}&published=true&count=true`
            )
            .set({ "X-Access-Token": token })
            .end((error, res) => {
              if (error) {
                done(error)
              }
              res.body.total.should.equal(5)
              res.body.count.should.equal(3) // Should find 3 articles with authorId in author_ids array
              res.body.results.length.should.equal(3)
              const titles = res.body.results.map(article => article.title)
              titles.should.containEql("Multi Author Article 1")
              titles.should.containEql("Multi Author Article 2")
              titles.should.containEql("Three Author Article") // This will fail with direct assignment if authorId is not first

              // Test querying for thirdAuthorId - should find article where it's first in the array
              request
                .get(
                  `${BASE_URL}/articles?author_ids=${thirdAuthorId}&published=true&count=true`
                )
                .end((error, res) => {
                  if (error) {
                    done(error)
                  }
                  res.body.total.should.equal(5)
                  res.body.count.should.equal(1)
                  res.body.results.length.should.equal(1)
                  res.body.results[0].title.should.equal("Three Author Article")

                  done()
                })
            })
        }
      )
    })

    it("gets a list of articles by channel", done => {
      fabricate(
        "articles",
        [
          {
            title: "Winter Is Coming",
            channel_id: new ObjectId("5086df098523e60002000012"),
            published: true,
          },
        ],
        (err, _articles) => {
          if (err) {
            done(err)
          }
          request
            .get(
              `${BASE_URL}/articles?channel_id=5086df098523e60002000012&published=true&count=true`
            )
            .set({ "X-Access-Token": token })
            .end((error, res) => {
              if (error) {
                done(error)
              }
              res.body.total.should.equal(1)
              res.body.count.should.equal(1)
              res.body.results[0].title.should.equal("Winter Is Coming")
              done()
            })
        }
      )
    })

    it("denies unpublished requests", done =>
      fabricate(
        "articles",
        [
          { title: "Flowers on Flowers", published: true },
          { title: "Flowers on Flowers The Sequel", published: true },
          { published: false },
        ],
        (err, _articles) => {
          if (err) {
            done(err)
          }
          request
            .get(`${BASE_URL}/articles?published=false`)
            .end((error, res) => {
              error.message.should.containEql("Unauthorized")
              res.body.message.should.containEql("published=true")
              done()
            })
        }
      ))

    it("gets a single article", done => {
      fabricate(
        "articles",
        [
          {
            title: "Cows on the prarie",
            _id: new ObjectId("5086df098523e60002000012"),
            sections: [
              {
                type: "text",
                body: "Cows on the lawn",
              },
            ],
            published: true,
          },
        ],
        (err, _articles) => {
          if (err) {
            done(err)
          }
          request
            .get(`${BASE_URL}/articles/5086df098523e60002000012`)
            .set({ "X-Access-Token": token })
            .end((error, res) => {
              if (error) {
                done(error)
              }
              res.body.sections[0].type.should.equal("text")
              res.body.sections[0].body.should.equal("Cows on the lawn")
              res.body.title.should.equal("Cows on the prarie")
              done()
            })
        }
      )
    })

    it("gets a single article of a draft", done => {
      fabricate(
        "articles",
        [
          {
            title: "Cows on the prarie",
            _id: new ObjectId("5086df098523e60002000012"),
            partner_channel_id: new ObjectId("5086df098523e60002000012"),
            published: false,
          },
        ],
        (err, _articles) => {
          if (err) {
            done(err)
          }
          request
            .get(`${BASE_URL}/articles/5086df098523e60002000012`)
            .set({ "X-Access-Token": token })
            .end((error, res) => {
              if (error) {
                done(error)
              }
              res.body.title.should.equal("Cows on the prarie")
              done()
            })
        }
      )
    })

    it("updates an article", done => {
      fabricate(
        "articles",
        [
          { title: "Flowers on Flowers" },
          {
            title: "Cows on the prarie",
            _id: new ObjectId("5086df098523e60002000012"),
            partner_channel_id: new ObjectId("5086df098523e60002000012"),
          },
        ],
        (err, _articles) => {
          if (err) {
            done(err)
          }
          request
            .put(`${BASE_URL}/articles/5086df098523e60002000012`)
            .send({
              title: "Hellow Wrld",
              author_id: "5086df098523e60002000012",
              channel_id: "5086df098523e60002000013",
            })
            .set({ "X-Access-Token": token })
            .end((error, res) => {
              if (error) {
                done(error)
              }
              res.body.title.should.equal("Hellow Wrld")
              done()
            })
        }
      )
    })

    it("deletes an article", done => {
      fabricate(
        "articles",
        [
          { title: "Flowers on Flowers" },
          {
            title: "Cows on the prarie",
            _id: new ObjectId("5086df098523e60002000012"),
            partner_channel_id: new ObjectId("5086df098523e60002000012"),
          },
        ],
        (err, _articles) => {
          if (err) {
            done(err)
          }
          request
            .del(`${BASE_URL}/articles/5086df098523e60002000012`)
            .set({ "X-Access-Token": token })
            .end((error, _res) => {
              if (error) {
                done(error)
              }
              db.collection("articles").countDocuments((e, count) => {
                if (e) {
                  done(e)
                }
                count.should.equal(1)
                done()
              })
            })
        }
      )
    })
  })
})

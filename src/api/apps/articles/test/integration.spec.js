/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { db, fixtures, fabricate, empty } = require("../../../test/helpers/db")
const app = require("../../../")
const request = require("superagent")
const { ObjectId } = require("mongojs")

describe("articles endpoints", function() {
  beforeEach(function(done) {
    empty(() => {
      this.token = fixtures().users.access_token
      fabricate("users", {}, (err, user) => {
        if (err) {
          done(err)
        }
        this.user = user
        this.server = app.listen(5000, () => done())
      })
    })
  })

  afterEach(function() {
    this.server.close()
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
        function(err, articles) {
          if (err) {
            done(err)
          }
          request
            .get("http://localhost:5000/articles?count=true")
            .end(function(err, res) {
              if (err) {
                done(err)
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

  describe("as a non-admin", function() {
    beforeEach(function(done) {
      this.normieToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsInR5cGUiOiJVc2VyIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwidHlwZSI6IlVzZXIiLCJwYXJ0bmVyX2lkcyI6W10sImlhdCI6MTUxNjIzOTAyMn0.1ONei7j20cbeusjWiUvTt-CTDCdpewnj3mbmIA_-Hbs"
       fabricate(
        "users",
        {
          type: "User",
          name: "Normie",
          access_token: this.normieToken,
          has_partner_access: false,
          _id: undefined,
        },
        (err, normie) => {
          this.normie = normie
          if (err) {
            done(err)
          }
          done()
        }
      )
    })

    it("does not allow featuring", function(done) {
      request
        .post("http://localhost:5000/articles")
        .set({ "X-Access-Token": this.normieToken })
        .send({ featured: true })
        .end(function(err, res) {
          err.status.should.equal(401)
          res.body.message.should.containEql("must be an admin")
          done()
        })
    })

    xit("does not allow viewing drafts", done =>
      fabricate(
        "articles",
        [
          {
            title: "Cows on the prarie",
            _id: ObjectId("5086df098523e60002000012"),
            partner_channel_id: ObjectId("5086df098523e60002000012"),
            published: false,
          },
        ],
        function(err, articles) {
          if (err) {
            done(err)
          }
          request
            .get("http://localhost:5000/articles/5086df098523e60002000012")
            .end(function(err, res) {
              if (err) {
                done(err)
              }
              err.status.should.equal(404)
              done()
            })
        }
      ))
  })

  describe("as a channel member", function() {
    it("creates articles", function(done) {
      request
        .post("http://localhost:5000/articles")
        .set({ "X-Access-Token": this.token })
        .send({
          title: "Hi",
          partner_channel_id: "5086df098523e60002000012",
          author_id: "5086df098523e60002000012",
        })
        .end(function(err, res) {
          if (err) {
            done(err)
          }
          res.body.title.should.equal("Hi")
          done()
        })
    })

    it("gets a list of articles by author", function(done) {
      fabricate(
        "articles",
        [
          { title: "Flowers on Flowers", author_id: this.user._id },
          { title: "Flowers on Flowers The Sequel", author_id: this.user._id },
          {},
        ],
        (err, articles) => {
          if (err) {
            done(err)
          }
          request
            .get(
              `http://localhost:5000/articles?author_id=${
                this.user._id
              }&published=true&count=true`
            )
            .set({ "X-Access-Token": this.token })
            .end(function(err, res) {
              if (err) {
                done(err)
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

    it("gets a list of articles by channel", function(done) {
      fabricate(
        "articles",
        [
          {
            title: "Winter Is Coming",
            channel_id: ObjectId("5086df098523e60002000012"),
            published: true,
          },
        ],
        (err, articles) => {
          if (err) {
            done(err)
          }
          request
            .get(
              "http://localhost:5000/articles?channel_id=5086df098523e60002000012&published=true&count=true"
            )
            .set({ "X-Access-Token": this.token })
            .end(function(err, res) {
              if (err) {
                done(err)
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
        function(err, articles) {
          if (err) {
            done(err)
          }
          request
            .get("http://localhost:5000/articles?published=false")
            .end(function(err, res) {
              err.message.should.containEql("Unauthorized")
              res.body.message.should.containEql("published=true")
              done()
            })
        }
      ))

    it("gets a single article", function(done) {
      fabricate(
        "articles",
        [
          {
            title: "Cows on the prarie",
            _id: ObjectId("5086df098523e60002000012"),
            sections: [
              {
                type: "text",
                body: "Cows on the lawn",
              },
            ],
            published: true,
          },
        ],
        (err, articles) => {
          if (err) {
            done(err)
          }
          request
            .get("http://localhost:5000/articles/5086df098523e60002000012")
            .set({ "X-Access-Token": this.token })
            .end(function(err, res) {
              if (err) {
                done(err)
              }
              res.body.sections[0].type.should.equal("text")
              res.body.sections[0].body.should.equal("Cows on the lawn")
              res.body.title.should.equal("Cows on the prarie")
              done()
            })
        }
      )
    })

    it("gets a single article of a draft", function(done) {
      fabricate(
        "articles",
        [
          {
            title: "Cows on the prarie",
            _id: ObjectId("5086df098523e60002000012"),
            partner_channel_id: ObjectId("5086df098523e60002000012"),
            published: false,
          },
        ],
        (err, articles) => {
          if (err) {
            done(err)
          }
          request
            .get("http://localhost:5000/articles/5086df098523e60002000012")
            .set({ "X-Access-Token": this.token })
            .end(function(err, res) {
              if (err) {
                done(err)
              }
              res.body.title.should.equal("Cows on the prarie")
              done()
            })
        }
      )
    })

    it("updates an article", function(done) {
      fabricate(
        "articles",
        [
          { title: "Flowers on Flowers" },
          {
            title: "Cows on the prarie",
            _id: ObjectId("5086df098523e60002000012"),
            partner_channel_id: ObjectId("5086df098523e60002000012"),
          },
        ],
        (err, articles) => {
          if (err) {
            done(err)
          }
          request
            .put("http://localhost:5000/articles/5086df098523e60002000012")
            .send({
              title: "Hellow Wrld",
              author_id: "5086df098523e60002000012",
              channel_id: "5086df098523e60002000013",
            })
            .set({ "X-Access-Token": this.token })
            .end(function(err, res) {
              if (err) {
                done(err)
              }
              res.body.title.should.equal("Hellow Wrld")
              done()
            })
        }
      )
    })

    it("deletes an article", function(done) {
      fabricate(
        "articles",
        [
          { title: "Flowers on Flowers" },
          {
            title: "Cows on the prarie",
            _id: ObjectId("5086df098523e60002000012"),
            partner_channel_id: ObjectId("5086df098523e60002000012"),
          },
        ],
        (err, articles) => {
          if (err) {
            done(err)
          }
          request
            .del("http://localhost:5000/articles/5086df098523e60002000012")
            .set({ "X-Access-Token": this.token })
            .end((err, res) => {
              if (err) {
                done(err)
              }
              db.articles.count(function(err, count) {
                if (err) {
                  done(err)
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

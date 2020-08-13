/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { EDITORIAL_CHANNEL } = process.env
const _ = require("underscore")
const rewire = require("rewire")
const { fabricate, empty } = require("../../../../test/helpers/db")
const Distribute = rewire("../../model/distribute")
const gravity = require("@artsy/antigravity").server
const app = require("express")()
const sinon = require("sinon")

describe("Save", function() {
  before(function(done) {
    app.use("/__gravity", gravity)
    this.server = app.listen(5000, () => done())
  })

  after(function() {
    this.server.close()
  })

  beforeEach(function(done) {
    this.sailthru = Distribute.__get__("sailthru")
    this.sailthru.apiPost = sinon.stub().yields()
    this.sailthru.apiDelete = sinon.stub().yields()
    Distribute.__set__("sailthru", this.sailthru)
    Distribute.__set__("request", {
      post: (this.post = sinon.stub()).returns({
        send: (this.send = sinon.stub()).returns({
          end: sinon.stub().yields(),
        }),
      }),
    })
    empty(() =>
      fabricate("articles", _.times(10, () => ({})), () => done())
    )
  })

  describe("#distributeArticle", () =>
    describe("sends article to sailthru", function() {
      describe("article url", function() {
        let article = {}

        beforeEach(() =>
          (article = {
            author_id: "5086df098523e60002000018",
            published: true,
            slugs: ["artsy-editorial-slug-one", "artsy-editorial-slug-two"],
          }))

        it("constructs the url for classic articles", function(done) {
          article.layout = "classic"
          Distribute.distributeArticle(article, function() {})
          this.sailthru.apiPost.args[0][1].url.should.containEql(
            "article/artsy-editorial-slug-two"
          )
          done()
        })

        it("constructs the url for standard articles", function(done) {
          article.layout = "standard"
          Distribute.distributeArticle(article, function() {})
          this.sailthru.apiPost.args[0][1].url.should.containEql(
            "article/artsy-editorial-slug-two"
          )
          done()
        })

        it("constructs the url for feature articles", function(done) {
          article.layout = "feature"
          Distribute.distributeArticle(article, function() {})
          this.sailthru.apiPost.args[0][1].url.should.containEql(
            "article/artsy-editorial-slug-two"
          )
          done()
        })

        it("constructs the url for series articles", function(done) {
          article.layout = "series"
          Distribute.distributeArticle(article, function() {})
          this.sailthru.apiPost.args[0][1].url.should.containEql(
            "series/artsy-editorial-slug-two"
          )
          done()
        })

        it("constructs the url for video articles", function(done) {
          article.layout = "video"
          Distribute.distributeArticle(article, function() {})
          this.sailthru.apiPost.args[0][1].url.should.containEql(
            "video/artsy-editorial-slug-two"
          )
          done()
        })

        it("constructs the url for news articles", function(done) {
          article.layout = "news"
          Distribute.distributeArticle(article, function() {})
          this.sailthru.apiPost.args[0][1].url.should.containEql(
            "news/artsy-editorial-slug-two"
          )
          done()
        })
      })

      it("concats the article tag for a normal article", function(done) {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
          },
          (err, article) => {
            this.sailthru.apiPost.calledOnce.should.be.true()
            this.sailthru.apiPost.args[0][1].tags.should.containEql("article")
            this.sailthru.apiPost.args[0][1].tags.should.not.containEql(
              "artsy-editorial"
            )
            done()
          }
        )
      })

      it("concats the article and artsy-editorial tag for editorial channel", function(done) {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
            channel_id: EDITORIAL_CHANNEL,
          },
          (err, article) => {
            this.sailthru.apiPost.calledOnce.should.be.true()
            this.sailthru.apiPost.args[0][1].tags.should.containEql("article")
            this.sailthru.apiPost.args[0][1].tags.should.containEql(
              "artsy-editorial"
            )
            done()
          }
        )
      })

      it("does not send if it is scheduled", function(done) {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: false,
            scheduled_publish_at: "10-10-11",
          },
          (err, article) => {
            this.sailthru.apiPost.calledOnce.should.be.false()
            done()
          }
        )
      })

      it("concats the tracking_tags and vertical", function(done) {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
            keywords: ["China"],
            tracking_tags: ["explainers", "profiles"],
            vertical: { name: "culture", id: "591b0babc88a280f5e9efa7a" },
          },
          (err, article) => {
            this.sailthru.apiPost.calledOnce.should.be.true()
            this.sailthru.apiPost.args[0][1].tags.should.containEql("China")
            this.sailthru.apiPost.args[0][1].tags.should.containEql(
              "explainers"
            )
            this.sailthru.apiPost.args[0][1].tags.should.containEql("profiles")
            this.sailthru.apiPost.args[0][1].tags.should.containEql("culture")
            done()
          }
        )
      })

      it("sends vertical as a custom variable", function(done) {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
            vertical: { name: "culture", id: "591b0babc88a280f5e9efa7a" },
          },
          (err, article) => {
            this.sailthru.apiPost.calledOnce.should.be.true()
            this.sailthru.apiPost.args[0][1].vars.vertical.should.equal(
              "culture"
            )
            done()
          }
        )
      })

      it("sends layout as a custom variable", function(done) {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
            layout: "news",
          },
          (err, article) => {
            this.sailthru.apiPost.calledOnce.should.be.true()
            this.sailthru.apiPost.args[0][1].vars.layout.should.equal("news")
            done()
          }
        )
      })

      it("concats the keywords at the end", function(done) {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
            keywords: ["sofa", "midcentury", "knoll"],
          },
          (err, article) => {
            this.sailthru.apiPost.calledOnce.should.be.true()
            this.sailthru.apiPost.args[0][1].tags[0].should.equal("article")
            this.sailthru.apiPost.args[0][1].tags[1].should.equal("sofa")
            this.sailthru.apiPost.args[0][1].tags[2].should.equal("midcentury")
            this.sailthru.apiPost.args[0][1].tags[3].should.equal("knoll")
            done()
          }
        )
      })

      it("uses email_metadata vars if provided", function(done) {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
            email_metadata: {
              headline: "Article Email Title",
              author: "Kana Abe",
              image_url: "imageurl.com/image.jpg",
            },
          },
          (err, article) => {
            this.sailthru.apiPost.args[0][1].title.should.containEql(
              "Article Email Title"
            )
            this.sailthru.apiPost.args[0][1].author.should.containEql(
              "Kana Abe"
            )
            this.sailthru.apiPost.args[0][1].images.full.url.should.containEql(
              "&width=1200&height=706&quality=95&src=imageurl.com%2Fimage.jpg"
            )
            this.sailthru.apiPost.args[0][1].images.thumb.url.should.containEql(
              "&width=900&height=530&quality=95&src=imageurl.com%2Fimage.jpg"
            )
            done()
          }
        )
      })

      it("sends the article text body", function(done) {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
            send_body: true,
            sections: [
              {
                type: "text",
                body: "<html>BODY OF TEXT</html>",
              },
              {
                type: "image_collection",
                images: [
                  {
                    caption: "This Caption",
                    url: "URL",
                  },
                ],
              },
            ],
          },
          (err, article) => {
            this.sailthru.apiPost.args[0][1].vars.html.should.containEql(
              "<html>BODY OF TEXT</html>"
            )
            this.sailthru.apiPost.args[0][1].vars.html.should.not.containEql(
              "This Caption"
            )
            done()
          }
        )
      })

      it("deletes all previously formed slugs in Sailthru", function(done) {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
            slugs: [
              "artsy-editorial-slug-one",
              "artsy-editorial-slug-two",
              "artsy-editorial-slug-three",
            ],
          },
          (err, article) => {
            this.sailthru.apiDelete.callCount.should.equal(2)
            this.sailthru.apiDelete.args[0][1].url.should.containEql("slug-one")
            this.sailthru.apiDelete.args[1][1].url.should.containEql("slug-two")
            done()
          }
        )
      })
    }))

  describe("#deleteArticleFromSailthru", () =>
    it("deletes the article from sailthru", function(done) {
      Distribute.deleteArticleFromSailthru(
        "artsy-editorial-delete-me",
        (err, article) => {
          this.sailthru.apiDelete.args[0][1].url.should.containEql(
            "artsy-editorial-delete-me"
          )
          done()
        }
      )
    }))

  describe("#cleanArticlesInSailthru", () =>
    it("Calls #deleteArticleFromSailthru on slugs that are not last", function(done) {
      Distribute.deleteArticleFromSailthru = sinon.stub()
      Distribute.cleanArticlesInSailthru({
        author_id: "5086df098523e60002000018",
        layout: "video",
        published: true,
        slugs: [
          "artsy-editorial-slug-one",
          "artsy-editorial-slug-two",
          "artsy-editorial-slug-three",
        ],
      })
      Distribute.deleteArticleFromSailthru.args[0][0].should.containEql(
        "/video/artsy-editorial-slug-one"
      )
      Distribute.deleteArticleFromSailthru.args[1][0].should.containEql(
        "/video/artsy-editorial-slug-two"
      )
      done()
    }))

  describe("#getArticleUrl", function() {
    it("constructs the url for an article using the last slug by default", function() {
      const article = {
        layout: "classic",
        slugs: ["artsy-editorial-slug-one", "artsy-editorial-slug-two"],
      }
      const url = Distribute.getArticleUrl(article)
      url.should.containEql("article/artsy-editorial-slug-two")
    })

    it("Can use a specified slug if provided", function() {
      const article = {
        layout: "classic",
        slugs: ["artsy-editorial-slug-one", "artsy-editorial-slug-two"],
      }
      const url = Distribute.getArticleUrl(article, article.slugs[0])
      url.should.containEql("article/artsy-editorial-slug-one")
    })
  })
})

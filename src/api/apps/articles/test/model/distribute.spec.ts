import rewire from "rewire"
import sinon from "sinon"
import { times } from "underscore"
const { EDITORIAL_CHANNEL } = process.env
const { fabricate, empty } = require("../../../../test/helpers/db.coffee")
const Distribute = rewire("../../model/distribute.coffee")
const gravity = require("@artsy/antigravity").server
const app = require("express")()

describe("Save", () => {
  let server
  let sailthru
  // @ts-ignore
  before(done => {
    app.use("/__gravity", gravity)
    server = app.listen(5000, () => done())
  })

  // @ts-ignore
  after(() => {
    server.close()
  })

  beforeEach(done => {
    sailthru = Distribute.__get__("sailthru")
    sailthru.apiPost = sinon.stub().yields()
    sailthru.apiDelete = sinon.stub().yields()
    Distribute.__set__("sailthru", sailthru)
    Distribute.__set__("request", {
      post: sinon.stub().returns({
        send: sinon.stub().returns({
          end: sinon.stub().yields(),
        }),
      }),
    })
    empty(() => fabricate("articles", times(10, () => ({})), () => done()))
  })

  describe("#distributeArticle", () =>
    describe("sends article to sailthru", () => {
      describe("article url", () => {
        let article: any = {}

        beforeEach(() =>
          (article = {
            author_id: "5086df098523e60002000018",
            published: true,
            slugs: ["artsy-editorial-slug-one", "artsy-editorial-slug-two"],
          }))

        it("constructs the url for classic articles", done => {
          article.layout = "classic"
          Distribute.distributeArticle(article, () => {
            return
          })
          sailthru.apiPost.args[0][1].url.should.containEql(
            "article/artsy-editorial-slug-two"
          )
          done()
        })

        it("constructs the url for standard articles", done => {
          article.layout = "standard"
          Distribute.distributeArticle(article, () => {
            return
          })
          sailthru.apiPost.args[0][1].url.should.containEql(
            "article/artsy-editorial-slug-two"
          )
          done()
        })

        it("constructs the url for feature articles", done => {
          article.layout = "feature"
          Distribute.distributeArticle(article, () => {
            return
          })
          sailthru.apiPost.args[0][1].url.should.containEql(
            "article/artsy-editorial-slug-two"
          )
          done()
        })

        it("constructs the url for series articles", done => {
          article.layout = "series"

          Distribute.distributeArticle(article, () => {
            return
          })
          sailthru.apiPost.args[0][1].url.should.containEql(
            "series/artsy-editorial-slug-two"
          )
          done()
        })

        it("constructs the url for video articles", done => {
          article.layout = "video"
          Distribute.distributeArticle(article, () => {
            return
          })
          sailthru.apiPost.args[0][1].url.should.containEql(
            "video/artsy-editorial-slug-two"
          )
          done()
        })

        it("constructs the url for news articles", done => {
          article.layout = "news"
          Distribute.distributeArticle(article, () => {
            return
          })
          sailthru.apiPost.args[0][1].url.should.containEql(
            "news/artsy-editorial-slug-two"
          )
          done()
        })
      })

      it("concats the article tag for a normal article", done => {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
          },
          (_err, _article) => {
            sailthru.apiPost.calledOnce.should.be.true()
            sailthru.apiPost.args[0][1].tags.should.containEql("article")
            sailthru.apiPost.args[0][1].tags.should.not.containEql(
              "artsy-editorial"
            )
            done()
          }
        )
      })

      it("concats the article and artsy-editorial tag for editorial channel", done => {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
            channel_id: EDITORIAL_CHANNEL,
          },
          (_err, _article) => {
            sailthru.apiPost.calledOnce.should.be.true()
            sailthru.apiPost.args[0][1].tags.should.containEql("article")
            sailthru.apiPost.args[0][1].tags.should.containEql(
              "artsy-editorial"
            )
            done()
          }
        )
      })

      it("does not send if it is scheduled", done => {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: false,
            scheduled_publish_at: "10-10-11",
          },
          (_err, _article) => {
            sailthru.apiPost.calledOnce.should.be.false()
            done()
          }
        )
      })

      it("concats the tracking_tags and vertical", done => {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
            keywords: ["China"],
            tracking_tags: ["explainers", "profiles"],
            vertical: { name: "culture", id: "591b0babc88a280f5e9efa7a" },
          },
          (_err, _article) => {
            sailthru.apiPost.calledOnce.should.be.true()
            sailthru.apiPost.args[0][1].tags.should.containEql("China")
            sailthru.apiPost.args[0][1].tags.should.containEql("explainers")
            sailthru.apiPost.args[0][1].tags.should.containEql("profiles")
            sailthru.apiPost.args[0][1].tags.should.containEql("culture")
            done()
          }
        )
      })

      it("sends vertical as a custom variable", done => {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
            vertical: { name: "culture", id: "591b0babc88a280f5e9efa7a" },
          },
          (_err, _article) => {
            sailthru.apiPost.calledOnce.should.be.true()
            sailthru.apiPost.args[0][1].vars.vertical.should.equal("culture")
            done()
          }
        )
      })

      it("sends layout as a custom variable", done => {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
            layout: "news",
          },
          (_err, _article) => {
            sailthru.apiPost.calledOnce.should.be.true()
            sailthru.apiPost.args[0][1].vars.layout.should.equal("news")
            done()
          }
        )
      })

      it("concats the keywords at the end", done => {
        Distribute.distributeArticle(
          {
            author_id: "5086df098523e60002000018",
            published: true,
            keywords: ["sofa", "midcentury", "knoll"],
          },
          (_err, _article) => {
            sailthru.apiPost.calledOnce.should.be.true()
            sailthru.apiPost.args[0][1].tags[0].should.equal("article")
            sailthru.apiPost.args[0][1].tags[1].should.equal("sofa")
            sailthru.apiPost.args[0][1].tags[2].should.equal("midcentury")
            sailthru.apiPost.args[0][1].tags[3].should.equal("knoll")
            done()
          }
        )
      })

      it("uses email_metadata vars if provided", done => {
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
          (_err, _article) => {
            sailthru.apiPost.args[0][1].title.should.containEql(
              "Article Email Title"
            )
            sailthru.apiPost.args[0][1].author.should.containEql("Kana Abe")
            sailthru.apiPost.args[0][1].images.full.url.should.containEql(
              "&width=1200&height=706&quality=95&src=imageurl.com%2Fimage.jpg"
            )
            sailthru.apiPost.args[0][1].images.thumb.url.should.containEql(
              "&width=900&height=530&quality=95&src=imageurl.com%2Fimage.jpg"
            )
            done()
          }
        )
      })

      it("sends the article text body", done => {
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
          (_err, _article) => {
            sailthru.apiPost.args[0][1].vars.html.should.containEql(
              "<html>BODY OF TEXT</html>"
            )
            sailthru.apiPost.args[0][1].vars.html.should.not.containEql(
              "This Caption"
            )
            done()
          }
        )
      })

      it("deletes all previously formed slugs in Sailthru", done => {
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
          (_err, _article) => {
            sailthru.apiDelete.callCount.should.equal(2)
            sailthru.apiDelete.args[0][1].url.should.containEql("slug-one")
            sailthru.apiDelete.args[1][1].url.should.containEql("slug-two")
            done()
          }
        )
      })
    }))

  describe("#deleteArticleFromSailthru", () =>
    it("deletes the article from sailthru", done => {
      Distribute.deleteArticleFromSailthru(
        "artsy-editorial-delete-me",
        (_err, _article) => {
          sailthru.apiDelete.args[0][1].url.should.containEql(
            "artsy-editorial-delete-me"
          )
          done()
        }
      )
    }))

  describe("#cleanArticlesInSailthru", () =>
    it("Calls #deleteArticleFromSailthru on slugs that are not last", done => {
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

  describe("#getArticleUrl", () => {
    it("constructs the url for an article using the last slug by default", () => {
      const article = {
        layout: "classic",
        slugs: ["artsy-editorial-slug-one", "artsy-editorial-slug-two"],
      }
      const url = Distribute.getArticleUrl(article)
      url.should.containEql("article/artsy-editorial-slug-two")
    })

    it("Can use a specified slug if provided", () => {
      const article = {
        layout: "classic",
        slugs: ["artsy-editorial-slug-one", "artsy-editorial-slug-two"],
      }
      const url = Distribute.getArticleUrl(article, article.slugs[0])
      url.should.containEql("article/artsy-editorial-slug-one")
    })
  })
})

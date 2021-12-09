import rewire from "rewire"
const Distribute = rewire("../../model/distribute.coffee")
const gravity = require("@artsy/antigravity").server
const app = require("express")()

describe("Save", () => {
  let server
  // @ts-ignore
  before(done => {
    app.use("/__gravity", gravity)
    server = app.listen(5000, () => done())
  })

  // @ts-ignore
  after(() => {
    server.close()
  })

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

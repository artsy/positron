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

  describe("#indexForSearch", () => {
    const setSearchStub = (calls: any[]) => {
      const searchStub = {
        index: (params: any, cb: Function) => {
          calls.push(params)
          cb && cb(null, { result: "ok" })
        },
      }
      Distribute.__set__("search", {
        client: searchStub,
        index: "test-index",
      })
    }

    const setArticleCtorStub = () => {
      const MockArticle = function(_article: any) {}
      // @ts-ignore
      MockArticle.prototype.isVisibleToPublic = () => true
      // @ts-ignore
      MockArticle.prototype.searchBoost = () => 1.0
      Distribute.__set__("Article", MockArticle)
    }

    beforeEach(() => {
      process.env.GEMINI_CLOUDFRONT_URL =
        process.env.GEMINI_CLOUDFRONT_URL || "https://gemini.example"
    })

    it("sets alternate_names from article.keywords", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article = {
        id: "123",
        slug: "test-article",
        title: "Test Article",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: ["art"],
        vertical: { name: "Editorial" },
        keywords: ["art", "contemporary"],
        sections: [{ body: "<p>Test content</p>" }],
        thumbnail_image: "https://example.com/image.jpg",
      }

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql(["art", "contemporary"])
        done()
      })
    })

    it("defaults alternate_names to [] when keywords is null", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article = {
        id: "456",
        slug: "no-keywords",
        title: "No Keywords",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: [],
        vertical: { name: "Editorial" },
        keywords: null,
        sections: [],
        thumbnail_image: "https://example.com/image.jpg",
      }

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql([])
        done()
      })
    })

    it("defaults alternate_names to [] when keywords is undefined", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article: any = {
        id: "789",
        slug: "undefined-keywords",
        title: "Undefined Keywords",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: [],
        vertical: { name: "Editorial" },
        sections: [],
        thumbnail_image: "https://example.com/image.jpg",
      }

      delete article.keywords

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql([])
        done()
      })
    })

    it("keeps alternate_names as [] when keywords is []", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article = {
        id: "101",
        slug: "empty-keywords",
        title: "Empty Keywords",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: [],
        vertical: { name: "Editorial" },
        keywords: [],
        sections: [],
        thumbnail_image: "https://example.com/image.jpg",
      }

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql([])
        done()
      })
    })

    it("handles articles with vertical and tags concatenation", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article = {
        id: "102",
        slug: "with-vertical",
        title: "Article with Vertical",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: ["art", "contemporary"],
        vertical: { name: "Editorial" },
        keywords: ["painting", "modern"],
        sections: [{ body: "<p>Test content</p>" }],
        thumbnail_image: "https://example.com/image.jpg",
      }

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql(["painting", "modern"])
        ;(body.tags as any).should.eql(["art", "contemporary", "Editorial"])
        done()
      })
    })

    it("handles articles without vertical", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article = {
        id: "103",
        slug: "no-vertical",
        title: "Article without Vertical",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: ["art", "contemporary"],
        keywords: ["painting", "modern"],
        sections: [{ body: "<p>Test content</p>" }],
        thumbnail_image: "https://example.com/image.jpg",
      }

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql(["painting", "modern"])
        ;(body.tags as any).should.eql(["art", "contemporary"])
        done()
      })
    })

    it("handles articles with null tags", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article = {
        id: "104",
        slug: "null-tags",
        title: "Article with Null Tags",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: [],
        vertical: { name: "Editorial" },
        keywords: ["painting", "modern"],
        sections: [{ body: "<p>Test content</p>" }],
        thumbnail_image: "https://example.com/image.jpg",
      }

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql(["painting", "modern"])
        ;(body.tags as any).should.eql(["Editorial"])
        done()
      })
    })

    it("handles articles with empty tags array", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article = {
        id: "105",
        slug: "empty-tags",
        title: "Article with Empty Tags",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: [],
        vertical: { name: "Editorial" },
        keywords: ["painting", "modern"],
        sections: [{ body: "<p>Test content</p>" }],
        thumbnail_image: "https://example.com/image.jpg",
      }

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql(["painting", "modern"])
        ;(body.tags as any).should.eql(["Editorial"])
        done()
      })
    })

    it("handles keywords with special characters and spaces", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article = {
        id: "106",
        slug: "special-keywords",
        title: "Article with Special Keywords",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: ["art"],
        keywords: [
          "contemporary art",
          "modern painting",
          "abstract-expressionism",
        ],
        sections: [{ body: "<p>Test content</p>" }],
        thumbnail_image: "https://example.com/image.jpg",
      }

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql([
          "contemporary art",
          "modern painting",
          "abstract-expressionism",
        ])
        done()
      })
    })

    it("handles keywords with numbers and symbols", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article = {
        id: "107",
        slug: "numeric-keywords",
        title: "Article with Numeric Keywords",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: ["art"],
        keywords: ["2024", "21st century", "post-modern", "art-2.0"],
        sections: [{ body: "<p>Test content</p>" }],
        thumbnail_image: "https://example.com/image.jpg",
      }

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql([
          "2024",
          "21st century",
          "post-modern",
          "art-2.0",
        ])
        done()
      })
    })

    it("handles keywords with unicode characters", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article = {
        id: "108",
        slug: "unicode-keywords",
        title: "Article with Unicode Keywords",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: ["art"],
        keywords: ["café", "naïve", "résumé", "über"],
        sections: [{ body: "<p>Test content</p>" }],
        thumbnail_image: "https://example.com/image.jpg",
      }

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql([
          "café",
          "naïve",
          "résumé",
          "über",
        ])
        done()
      })
    })

    it("handles keywords with very long strings", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article = {
        id: "109",
        slug: "long-keywords",
        title: "Article with Long Keywords",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: ["art"],
        keywords: [
          "very long keyword that might test edge cases in the system",
          "another extremely long keyword with many words and characters",
          "short",
        ],
        sections: [{ body: "<p>Test content</p>" }],
        thumbnail_image: "https://example.com/image.jpg",
      }

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql([
          "very long keyword that might test edge cases in the system",
          "another extremely long keyword with many words and characters",
          "short",
        ])
        done()
      })
    })

    it("handles keywords with falsy values (false, 0, empty string)", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article = {
        id: "110",
        slug: "falsy-keywords",
        title: "Article with Falsy Keywords",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: ["art"],
        keywords: [false, 0, "", "valid keyword"],
        sections: [{ body: "<p>Test content</p>" }],
        thumbnail_image: "https://example.com/image.jpg",
      }

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql([
          false,
          0,
          "",
          "valid keyword",
        ])
        done()
      })
    })

    it("handles keywords with mixed data types", done => {
      const calls: any[] = []
      setSearchStub(calls)
      setArticleCtorStub()

      const article = {
        id: "111",
        slug: "mixed-keywords",
        title: "Article with Mixed Keywords",
        description: "Test description",
        published: true,
        published_at: "2024-01-01T00:00:00Z",
        scheduled_publish_at: null,
        featured: false,
        author: { name: "Test Author" },
        tags: ["art"],
        keywords: ["string", 123, true, null, undefined, { object: "test" }],
        sections: [{ body: "<p>Test content</p>" }],
        thumbnail_image: "https://example.com/image.jpg",
      }

      Distribute.indexForSearch(article, () => {
        // eslint-disable-next-line
        ;(calls.length as any).should.equal(1)
        const body = calls[0].body
        ;(body.alternate_names as any).should.eql([
          "string",
          123,
          true,
          null,
          undefined,
          { object: "test" },
        ])
        done()
      })
    })
  })
})

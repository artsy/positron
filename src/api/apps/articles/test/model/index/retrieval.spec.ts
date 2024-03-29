import moment from "moment"
import { ObjectId } from "mongodb"
import { pluck, times } from "underscore"
import * as Article from "../../../model"
const {
  db,
  fabricate,
  empty,
} = require("../../../../../test/helpers/db.coffee")
const gravity = require("@artsy/antigravity").server
const app = require("express")()
const search = require("../../../../../lib/elasticsearch.coffee")

describe("Article Retrieval", () => {
  let server
  // @ts-ignore
  before(done => {
    app.use("/__gravity", gravity)
    server = app.listen(5000, () =>
      search.client.indices.create(
        { index: "articles_" + process.env.NODE_ENV },
        () => done()
      )
    )
  })
  // @ts-ignore
  after(() => {
    server.close()
    search.client.indices.delete({
      index: "articles_" + process.env.NODE_ENV,
    })
  })

  beforeEach(done =>
    empty(() => fabricate("articles", times(10, () => ({})), () => done())))

  describe("#where", () => {
    it("can  all articles along with total and counts", done =>
      Article.where({ count: true }, (_err, res) => {
        const { total, count, results } = res
        total.should.equal(10)
        count.should.equal(10)
        results[0].title.should.equal("Top Ten Booths")
        done()
      }))

    it("can  all articles along with total and counts", done =>
      Article.where({}, (_err, res) => {
        const { total, count, results } = res
        if (total != null) {
          total.should.be.false()
        }
        if (count != null) {
          count.should.be.false()
        }
        results[0].title.should.equal("Top Ten Booths")
        done()
      }))

    it("can return articles by an author", done => {
      let aid
      fabricate(
        "articles",
        {
          author_id: (aid = new ObjectId("4d8cd73191a5c50ce220002a")),
          title: "Hello Wurld",
        },
        () =>
          Article.where(
            { author_id: aid.toString(), count: true },
            (err, res) => {
              if (err) {
                done(err)
              }
              const { total, count, results } = res
              total.should.equal(11)
              count.should.equal(1)
              results[0].title.should.equal("Hello Wurld")
              done()
            }
          )
      )
    })

    it("can return articles by published", done =>
      fabricate(
        "articles",
        times(3, () => ({
          published: false,
          title: "Moo baz",
        })),
        () =>
          Article.where(
            { published: false, count: true },
            (err, { total, count, results }) => {
              if (err) {
                done(err)
              }
              total.should.equal(13)
              count.should.equal(3)
              results[0].title.should.equal("Moo baz")
              done()
            }
          )
      ))

    it("can change skip and limit", done =>
      fabricate(
        "articles",
        [{ title: "Hello Wurld" }, { title: "Foo Baz" }],
        () =>
          Article.where({ offset: 1, limit: 3 }, (err, { results }) => {
            if (err) {
              done(err)
            }
            results[0].title.should.equal("Hello Wurld")
            done()
          })
      ))

    it("sorts by -updated_at by default", done =>
      fabricate(
        "articles",
        [
          {
            title: "Hello Wurld",
            updated_at: moment()
              .add(1, "days")
              .format(),
          },
        ],
        () =>
          Article.where({}, (err, { results }) => {
            if (err) {
              done(err)
            }
            results[0].title.should.equal("Hello Wurld")
            done()
          })
      ))

    it("can find articles featured to an artist", done =>
      fabricate(
        "articles",
        [
          {
            title: "Foo",
            featured_artist_ids: [new ObjectId("4dc98d149a96300001003033")],
          },
          {
            title: "Bar",
            primary_featured_artist_ids: [
              new ObjectId("4dc98d149a96300001003033"),
            ],
          },
          {
            title: "Baz",
            featured_artist_ids: [new ObjectId("4dc98d149a96300001003033")],
            primary_featured_artist_ids: [
              new ObjectId("4dc98d149a96300001003033"),
            ],
          },
        ],
        () =>
          Article.where(
            { artist_id: "4dc98d149a96300001003033" },
            (err, { results }) => {
              if (err) {
                done(err)
              }
              pluck(results, "title")
                .sort()
                .join("")
                .should.equal("BarBazFoo")
              done()
            }
          )
      ))

    it("can find articles featured to an artwork", done =>
      fabricate(
        "articles",
        [
          {
            title: "Foo",
            featured_artwork_ids: [new ObjectId("4dc98d149a96300001003033")],
          },
          {
            title: "Baz",
            featured_artwork_ids: [new ObjectId("4dc98d149a96300001003033")],
          },
        ],
        () =>
          Article.where(
            { artwork_id: "4dc98d149a96300001003033" },
            (err, { results }) => {
              if (err) {
                done(err)
              }
              pluck(results, "title")
                .sort()
                .join("")
                .should.equal("BazFoo")
              done()
            }
          )
      ))

    it("can find articles sorted by an attr", done =>
      db.collection("articles").drop(() =>
        fabricate(
          "articles",
          [{ title: "C" }, { title: "A" }, { title: "B" }],
          () =>
            Article.where({ sort: "-title" }, (err, { results }) => {
              if (err) {
                done(err)
              }
              pluck(results, "title")
                .sort()
                .join("")
                .should.containEql("ABC")
              done()
            })
        )
      ))

    it("can find articles added to multiple fairs", done =>
      fabricate(
        "articles",
        [
          { title: "C", fair_ids: [new ObjectId("4dc98d149a96300001003033")] },
          { title: "A", fair_ids: [new ObjectId("4dc98d149a96300001003033")] },
          { title: "B", fair_ids: [new ObjectId("4dc98d149a96300001003032")] },
        ],
        () =>
          Article.where(
            {
              fair_ids: [
                "4dc98d149a96300001003033",
                "4dc98d149a96300001003032",
              ],
            },
            (err, { results }) => {
              if (err) {
                done(err)
              }
              pluck(results, "title")
                .sort()
                .join("")
                .should.equal("ABC")
              done()
            }
          )
      ))

    it("can find articles by a fair", done =>
      fabricate(
        "articles",
        [
          { title: "C", fair_ids: [new ObjectId("4dc98d149a96300001003033")] },
          { title: "A", fair_ids: [new ObjectId("4dc98d149a96300001003033")] },
        ],
        () =>
          Article.where(
            { fair_id: "4dc98d149a96300001003033" },
            (err, { results }) => {
              if (err) {
                done(err)
              }
              pluck(results, "title")
                .sort()
                .join("")
                .should.equal("AC")
              done()
            }
          )
      ))

    it("can return articles by a fair programming id", done => {
      fabricate(
        "articles",
        {
          author_id: new ObjectId("4d8cd73191a5c50ce220002a"),
          title: "Hello Wurld",
          fair_programming_ids: [new ObjectId("52617c6c8b3b81f094000013")],
        },
        () =>
          Article.where(
            { fair_programming_id: "52617c6c8b3b81f094000013", count: true },
            (err, res) => {
              if (err) {
                done(err)
              }
              const { total, count, results } = res
              total.should.equal(11)
              count.should.equal(1)
              results[0].title.should.equal("Hello Wurld")
              done()
            }
          )
      )
    })

    it("can return articles by a fair artsy id", done => {
      fabricate(
        "articles",
        {
          author_id: new ObjectId("4d8cd73191a5c50ce220002a"),
          title: "Hello Wurld",
          fair_artsy_ids: [new ObjectId("53da550a726169083c0a0700")],
        },
        () =>
          Article.where(
            { fair_artsy_id: "53da550a726169083c0a0700", count: true },
            (err, res) => {
              if (err) {
                done(err)
              }
              const { total, count, results } = res
              total.should.equal(11)
              count.should.equal(1)
              results[0].title.should.equal("Hello Wurld")
              done()
            }
          )
      )
    })

    it("can return articles by a fair about id", done => {
      fabricate(
        "articles",
        {
          author_id: new ObjectId("4d8cd73191a5c50ce220002a"),
          title: "Hello Wurld",
          fair_about_ids: [new ObjectId("53da550a726169083c0a0700")],
        },
        () =>
          Article.where(
            { fair_about_id: "53da550a726169083c0a0700", count: true },
            (err, res) => {
              if (err) {
                done(err)
              }
              const { total, count, results } = res
              total.should.equal(11)
              count.should.equal(1)
              results[0].title.should.equal("Hello Wurld")
              done()
            }
          )
      )
    })

    it("can find articles added to a partner", done =>
      fabricate(
        "articles",
        [
          {
            title: "Foo",
            partner_ids: [new ObjectId("4dc98d149a96300001003033")],
          },
          {
            title: "Bar",
            partner_ids: [new ObjectId("4dc98d149a96300001003033")],
          },
          {
            title: "Baz",
            partner_ids: [new ObjectId("4dc98d149a96300001003031")],
          },
        ],
        () =>
          Article.where(
            { partner_id: "4dc98d149a96300001003033" },
            (err, { results }) => {
              if (err) {
                done(err)
              }
              pluck(results, "title")
                .sort()
                .join("")
                .should.equal("BarFoo")
              done()
            }
          )
      ))

    it("can find articles by query", done =>
      fabricate(
        "articles",
        [
          { thumbnail_title: "Foo" },
          { thumbnail_title: "Bar" },
          { thumbnail_title: "Baz" },
        ],
        () =>
          Article.where({ q: "fo" }, (err, { results }) => {
            if (err) {
              done(err)
            }
            results[0].thumbnail_title.should.equal("Foo")
            done()
          })
      ))

    it("can find articles by all_by_author", done =>
      fabricate(
        "articles",
        [
          {
            author_id: new ObjectId("4d8cd73191a5c50ce220002a"),
            contributing_authors: [
              { id: new ObjectId("4d8cd73191a5c50ce220002b") },
            ],
            title: "Hello Wurld",
          },
          {
            author_id: new ObjectId("4d8cd73191a5c50ce220002b"),
            title: "Hello Waaarld",
          },
        ],
        () =>
          Article.where(
            { all_by_author: "4d8cd73191a5c50ce220002b", count: true },
            (err, res) => {
              if (err) {
                done(err)
              }
              const { total, count, results } = res
              total.should.equal(12)
              count.should.equal(2)
              results[0].title.should.equal("Hello Waaarld")
              results[1].title.should.equal("Hello Wurld")
              done()
            }
          )
      ))

    it("can find articles by super article", done =>
      fabricate(
        "articles",
        [
          {
            author_id: new ObjectId("4d8cd73191a5c50ce220002a"),
            title: "Hello Wurld",
            is_super_article: false,
          },
          {
            author_id: new ObjectId("4d8cd73191a5c50ce220002b"),
            title: "Hello Waaarldie",
            is_super_article: true,
          },
          {
            author_id: new ObjectId("4d8cd73191a5c50ce220002b"),
            title: "Hello Waaarld",
          },
        ],
        () =>
          Article.where({ is_super_article: true, count: true }, (err, res) => {
            if (err) {
              done(err)
            }
            const { total, count, results } = res
            total.should.equal(13)
            count.should.equal(1)
            results[0].title.should.equal("Hello Waaarldie")
            done()
          })
      ))

    it("can find super article by article (opposite of the above test!)", done => {
      const superArticleId = new ObjectId("4d7ab73191a5c50ce220001c")
      const childArticleId = new ObjectId("4d8cd73191a5c50ce111111a")
      fabricate(
        "articles",
        [
          {
            _id: childArticleId,
            author_id: new ObjectId("4d8cd73191a5c50ce220002a"),
            title: "Child Article",
            is_super_article: false,
          },
          {
            _id: superArticleId,
            author_id: new ObjectId("4d8cd73191a5c50ce220002b"),
            title: "Super Article",
            is_super_article: true,
            super_article: {
              related_articles: [childArticleId],
            },
          },
        ],
        () =>
          Article.where(
            { super_article_for: childArticleId.toString(), count: true },
            (err, res) => {
              if (err) {
                done(err)
              }
              const { total, count, results } = res
              total.should.equal(12)
              count.should.equal(1)
              results[0].title.should.equal("Super Article")
              done()
            }
          )
      )
    })

    it("can find articles by tags", done =>
      fabricate(
        "articles",
        [
          {
            author_id: new ObjectId("4d8cd73191a5c50ce220002a"),
            tags: ["pickle", "samosa"],
            title: "Hello Wuuuurld - Food",
          },
          {
            author_id: new ObjectId("4d8cd73191a5c50ce220002b"),
            tags: ["pickle", "muffin"],
            title: "Hello Waaarld - Food",
          },
          {
            author_id: new ObjectId("4d8cd73191a5c50ce220002c"),
            tags: ["muffin", "lentils"],
            title: "Hello Weeeerld - Food",
          },
          {
            author_id: new ObjectId("4d8cd73191a5c50ce220002e"),
            tags: ["radio", "pixels"],
            title: "Hello I am Weiiird - Electronics",
          },
        ],
        () =>
          Article.where(
            { tags: ["pickle", "muffin"], count: true },
            (err, res) => {
              if (err) {
                done(err)
              }
              const { total, count, results } = res
              total.should.equal(14)
              count.should.equal(3)
              results[0].title.should.equal("Hello Weeeerld - Food")
              results[1].title.should.equal("Hello Waaarld - Food")
              results[2].title.should.equal("Hello Wuuuurld - Food")
              done()
            }
          )
      ))

    it("can find articles by tracking_tags", done =>
      fabricate(
        "articles",
        [
          {
            author_id: new ObjectId("4d8cd73191a5c50ce220002a"),
            tracking_tags: ["video", "evergreen"],
            title:
              "The Shanghai Art Project That’s Working to Save Us from a Dystopian Future",
          },
          {
            author_id: new ObjectId("4d8cd73191a5c50ce220002b"),
            tracking_tags: ["video", "evergreen"],
            title:
              "$448 Million Christie’s Post-War and Contemporary Sale Led by Bacon and Twombly",
          },
          {
            author_id: new ObjectId("4d8cd73191a5c50ce220002c"),
            tracking_tags: ["podcast", "evergreen"],
            title: "8 Works to Collect at ARCOlisboa",
          },
          {
            author_id: new ObjectId("4d8cd73191a5c50ce220002e"),
            tracking_tags: ["op-eds", "explainers"],
            title:
              "NYC Releases Data That Will Help Shape the City’s Cultural Future",
          },
        ],
        () =>
          Article.where(
            { tracking_tags: ["video", "evergreen"], count: true },
            (err, res) => {
              if (err) {
                done(err)
              }
              const { total, count, results } = res
              total.should.equal(14)
              count.should.equal(3)
              results[0].title.should.equal("8 Works to Collect at ARCOlisboa")
              results[1].title.should.equal(
                "$448 Million Christie’s Post-War and Contemporary Sale Led by Bacon and Twombly"
              )
              results[2].title.should.equal(
                "The Shanghai Art Project That’s Working to Save Us from a Dystopian Future"
              )
              done()
            }
          )
      ))

    it("can find articles by artist biography", done =>
      fabricate(
        "articles",
        [
          {
            title: "Hello Wurld",
            published: true,
            biography_for_artist_id: new ObjectId("5086df098523e60002000016"),
          },
        ],
        () =>
          Article.where(
            {
              published: true,
              biography_for_artist_id: "5086df098523e60002000016",
              count: true,
            },
            (err, res) => {
              if (err) {
                done(err)
              }
              const { count, results } = res
              count.should.equal(1)
              results[0].title.should.equal("Hello Wurld")
              done()
            }
          )
      ))

    it("can find articles by channel_id", done =>
      fabricate(
        "articles",
        [
          {
            title: "Hello Wurld",
            published: true,
            channel_id: new ObjectId("5086df098523e60002000016"),
          },
        ],
        () =>
          Article.where(
            {
              published: true,
              channel_id: "5086df098523e60002000016",
              count: true,
            },
            (err, res) => {
              if (err) {
                done(err)
              }
              const { count, results } = res
              count.should.equal(1)
              results[0].title.should.equal("Hello Wurld")
              done()
            }
          )
      ))

    it("can find articles by partner_channel_id", done =>
      fabricate(
        "articles",
        [
          {
            title: "Hello Wurld",
            published: true,
            partner_channel_id: new ObjectId("5086df098523e60002000016"),
          },
        ],
        () =>
          Article.where(
            {
              published: true,
              channel_id: "5086df098523e60002000016",
              count: true,
            },
            (err, res) => {
              if (err) {
                done(err)
              }
              const { count, results } = res
              count.should.equal(1)
              results[0].title.should.equal("Hello Wurld")
              done()
            }
          )
      ))

    it("can find articles by scheduled", done =>
      fabricate(
        "articles",
        [
          {
            title: "Hello Wurld",
            published: false,
            scheduled_publish_at: "555",
          },
        ],
        () =>
          Article.where(
            {
              scheduled: true,
              count: true,
              published: false,
            },
            (err, res) => {
              if (err) {
                done(err)
              }
              const { count, results } = res
              count.should.equal(1)
              results[0].title.should.equal("Hello Wurld")
              done()
            }
          )
      ))

    it("can return articles by indexable", done =>
      fabricate(
        "articles",
        times(3, () => ({
          indexable: false,
          title: "Moo baz",
        })),
        () =>
          Article.where(
            { indexable: true, count: true },
            (err, { total, count, results }) => {
              if (err) {
                done(err)
              }
              total.should.equal(13)
              count.should.equal(10)
              results[0].title.should.not.equal("Moo baz")
              done()
            }
          )
      ))

    it("can return articles by not indexable", done =>
      fabricate(
        "articles",
        times(3, () => ({
          indexable: false,
          title: "Moo baz",
        })),
        () =>
          Article.where(
            { indexable: false, count: true },
            (err, { total, count, results }) => {
              if (err) {
                done(err)
              }
              total.should.equal(13)
              count.should.equal(3)
              results[0].title.should.equal("Moo baz")
              done()
            }
          )
      ))

    it("can omit articles", done =>
      fabricate(
        "articles",
        [
          {
            title: "Hello Wurld",
            _id: new ObjectId("5086df098523e60002000018"),
            published: true,
          },
        ],
        () =>
          Article.where(
            { omit: ["5086df098523e60002000018"], count: true },
            (err, { total, count }) => {
              if (err) {
                done(err)
              }
              total.should.equal(11)
              count.should.equal(10)
              done()
            }
          )
      ))
  })

  describe("#find", () => {
    it("finds an article by an id string", done =>
      fabricate(
        "articles",
        { _id: new ObjectId("5086df098523e60002000018") },
        () =>
          Article.find("5086df098523e60002000018", (err, article) => {
            if (err) {
              done(err)
            }
            article._id.toString().should.equal("5086df098523e60002000018")
            done()
          })
      ))

    it("can lookup an article by slug", done =>
      fabricate(
        "articles",
        {
          _id: new ObjectId("5086df098523e60002000018"),
          slugs: ["foo-bar"],
        },
        () =>
          Article.find("foo-bar", (err, article) => {
            if (err) {
              done(err)
            }
            article._id.toString().should.equal("5086df098523e60002000018")
            done()
          })
      ))
  })
})

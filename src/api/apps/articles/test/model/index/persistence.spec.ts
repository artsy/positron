// import rewire from "rewire"
import moment from "moment"
import { ObjectId } from "mongodb"
import { times } from "underscore"
const {
  db,
  fabricate,
  empty,
} = require("../../../../../test/helpers/db.coffee")
const rewire = require("rewire")
const Article = rewire("../../../model/index.js")
const gravity = require("@artsy/antigravity").server
const app = require("express")()
const search = require("../../../../../lib/elasticsearch.coffee")
const { amqp } = require("../../../../../lib/amqp")
import sinon from "sinon"
const Channel = require("../../../../channels/model.coffee")

process.env.ENABLE_PUBLISH_RABBITMQ_EVENTS = "true"

describe("Article Persistence", () => {
  let server
  let sandbox
  let publishStub

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

  beforeEach(done => {
    sandbox = sinon.createSandbox()
    publishStub = sandbox.stub(amqp, "publish")
    empty(() => fabricate("articles", times(10, () => ({})), () => done()))
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe("#save", () => {
    it("saves valid article input data", done =>
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
          id: "5086df098523e60002002222",
          channel_id: "5086df098523e60002002223",
          vertical: { name: "Culture", id: "55356a9deca560a0137bb4a7" },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.title.should.equal("Top Ten Shows")
          article.channel_id.toString().should.equal("5086df098523e60002002223")
          article.vertical.name.should.eql("Culture")
          db.collection("articles").countDocuments((error, count) => {
            if (error) {
              done(error)
            }
            count.should.equal(11)
            done()
          })
        }
      ))

    it("adds an updated_at as a date", done =>
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.updated_at.should.be.an.instanceOf(Date)
          moment(article.updated_at)
            .format("YYYY-MM-DD")
            // @ts-ignore
            .should.equal(moment().format("YYYY-MM-DD"))
          done()
        }
      ))

    it("input updated_at must be a date", done => {
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
          updated_at: "foo",
        },
        "foo",
        {},
        (err, _article) =>
          err.message.should.containEql(
            '"updated_at" must be a number of milliseconds or valid date string'
          )
      )
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
          updated_at: new Date(),
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          moment(article.updated_at)
            .format("YYYY-MM-DD")
            // @ts-ignore
            .should.equal(moment().format("YYYY-MM-DD"))
          done()
        }
      )
    })

    it("includes the id for a new article", done =>
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          // @ts-ignore
          ;(article._id != null).should.be.ok
          done()
        }
      ))

    it("adds a slug based off the thumbnail title", done =>
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
          author: {
            name: "Craig Spaeth",
          },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.slugs[0].should.equal("craig-spaeth-ten-shows")
          done()
        }
      ))

    it("adds a slug based off a user and thumbnail title", done =>
      fabricate("users", { name: "Molly" }, (err, user) => {
        if (err) {
          done(err)
        }
        Article.save(
          {
            thumbnail_title: "Foo Baz",
            author_id: user._id.toString(),
            author: {
              name: user.name,
            },
          },
          "foo",
          {},
          (error, article) => {
            if (error) {
              done(error)
            }
            article.slugs[0].should.equal("molly-foo-baz")
            done()
          }
        )
      }))

    it("saves slug history when publishing", done =>
      fabricate("users", { name: "Molly" }, (err, user) => {
        if (err) {
          done(err)
        }
        Article.save(
          {
            thumbnail_title: "Foo Baz",
            author_id: user._id.toString(),
            published: false,
            author: {
              name: user.name,
            },
          },
          "foo",
          {},
          (error, res) => {
            if (error) {
              done(error)
            }
            Article.save(
              {
                id: res._id.toString(),
                thumbnail_title: "Foo Bar Baz",
                author_id: user._id.toString(),
                published: true,
                layout: "standard",
                author: {
                  name: user.name,
                },
              },
              "foo",
              {},
              (e, a) => {
                if (e) {
                  done(e)
                }
                a.slugs.join("").should.equal("molly-foo-bazmolly-foo-bar-baz")
                Article.find(a.slugs[0], (er, article) => {
                  if (er) {
                    done(er)
                  }
                  article.thumbnail_title.should.equal("Foo Bar Baz")
                  done()
                })
              }
            )
          }
        )
      }))

    it("appends the date to an article URL when its slug already exists", done =>
      fabricate(
        "articles",
        {
          id: "5086df098523e60002002222",
          slugs: ["craig-spaeth-heyo"],
          author: {
            name: "Craig Spaeth",
          },
        },
        () =>
          Article.save(
            {
              thumbnail_title: "heyo",
              author_id: "5086df098523e60002000018",
              published_at: "01-01-99",
              published: true,
              id: "5086df098523e60002002222",
              author: {
                name: "Craig Spaeth",
              },
            },
            "foo",
            {},
            (err, article) => {
              if (err) {
                done(err)
              }
              article.slugs[0].should.equal("craig-spaeth-heyo-01-01-99")
              db.collection("articles").countDocuments((error, count) => {
                if (error) {
                  done(error)
                }
                count.should.equal(12)
                done()
              })
            }
          )
      ))

    it("sends RabbitMQ event when publishing", done => {
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
          published: true,
          id: "5086df098523e60002002222",
          primary_featured_artist_ids: ["52868347b202a37bb000072a"],
          channel_id: "5086df098523e60002000018",
        },
        "foo",
        {},
        (err, _) => {
          if (err) {
            done(err)
          }

          publishStub
            .withArgs("editorial", "article.published", {
              id: new ObjectId("5086df098523e60002002222"),
              title: "Top Ten Shows",
              featured_artist_ids: [new ObjectId("52868347b202a37bb000072a")],
              href: "/article/undefined-ten-shows",
            })
            .callCount.should.eql(1)

          done()
        }
      )
    })

    it("doesn't send RabbitMQ event when scheduling publishing", done => {
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
          scheduled_publish_at: moment("2040-01-01").toDate(),
          id: "5086df098523e60002002222",
          primary_featured_artist_ids: ["52868347b202a37bb000072a"],
          channel_id: "5086df098523e60002000018",
        },
        "foo",
        {},
        (err, _) => {
          if (err) {
            done(err)
          }

          publishStub.callCount.should.eql(0)

          done()
        }
      )
    })

    it("doesn't send RabbitMQ event when publishing not editorial article", done => {
      Channel.save({ name: "Channel", type: "team" }, (err, channel) => {
        if (err) {
          done(err)
        }

        Article.save(
          {
            title: "Top Ten Shows",
            thumbnail_title: "Ten Shows",
            author_id: "5086df098523e60002000018",
            published: true,
            id: "5086df098523e60002002222",
            primary_featured_artist_ids: ["52868347b202a37bb000072a"],
            channel_id: channel.id,
          },
          "foo",
          {},
          (err, _) => {
            if (err) {
              done(err)
            }

            publishStub.callCount.should.eql(0)

            done()
          }
        )
      })
    })

    it("doesn't send RabbitMQ event when article doesn't have primary_featured_artist_ids", done => {
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
          published: true,
          id: "5086df098523e60002002222",
          primary_featured_artist_ids: [],
          channel_id: "5086df098523e60002000018",
        },
        "foo",
        {},
        (err, _) => {
          if (err) {
            done(err)
          }

          publishStub.callCount.should.eql(0)

          done()
        }
      )
    })

    it("saves published_at when the article is published", done =>
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
          published: true,
          id: "5086df098523e60002002222",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.published_at.should.be.an.instanceOf(Date)
          moment(article.published_at)
            .format("YYYY")
            // @ts-ignore
            .should.equal(moment().format("YYYY"))
          done()
        }
      ))

    it("updates published_at when admin changes it", done =>
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
          published: true,
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          Article.save(
            {
              id: article._id.toString(),
              author_id: "5086df098523e60002000018",
              published_at: moment()
                .add(1, "year")
                .toDate(),
            },
            "foo",
            {},
            (error, updatedArticle) => {
              if (error) {
                done(error)
              }
              updatedArticle.published_at.should.be.an.instanceOf(Date)
              moment(updatedArticle.published_at)
                .format("YYYY")
                // @ts-ignore
                .should.equal(
                  moment()
                    .add(1, "year")
                    .format("YYYY")
                )
              done()
            }
          )
        }
      ))

    it("saves indexable when the article is published", done =>
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
          published: true,
          id: "5086df098523e60002002222",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.indexable.should.eql(true)
          done()
        }
      ))

    it("updates indexable when admin changes it", done =>
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.indexable.should.eql(true)
          Article.save(
            {
              id: article._id.toString(),
              author_id: "5086df098523e60002000018",
              indexable: false,
            },
            "foo",
            {},
            (error, updatedArticle) => {
              if (error) {
                done(error)
              }
              updatedArticle.indexable.should.eql(false)
              done()
            }
          )
        }
      ))

    it("doesnt save a fair unless explictly set", done =>
      Article.save(
        {
          title: "Top Ten Shows",
          thumbnail_title: "Ten Shows",
          author_id: "5086df098523e60002000018",
          fair_ids: [],
          published: true,
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          // @ts-ignore

          ;(article.fair_ids != null).should.not.be.ok
          done()
        }
      ))

    it("escapes xss", done => {
      const body =
        '<h2>Hi</h2><h3>Hello</h3><p><b>Hola</b></p><p><i>Guten Tag</i></p><ol><li>Bonjour<br></li><li><a href="http://www.foo.com/">Bonjour2</a></li></ol><ul><li>Aloha</li><li>Aloha Again</li></ul><h2><b><i>Good bye</i></b></h2><p><b><i>Adios</i></b></p><h3>Alfiederzen</h3><p><a href="http://foo.com/">Aloha</a></p>'
      const badBody =
        '<script>alert(foo)</script><h2>Hi</h2><h3>Hello</h3><p><b>Hola</b></p><p><i>Guten Tag</i></p><ol><li>Bonjour<br></li><li><a href="http://www.foo.com">Bonjour2</a></li></ol><ul><li>Aloha</li><li>Aloha Again</li></ul><h2><b><i>Good bye</i></b></h2><p><b><i>Adios</i></b></p><h3>Alfiederzen</h3><p><a href="http://foo.com">Aloha</a></p>'
      Article.save(
        {
          id: "5086df098523e60002000018",
          author_id: "5086df098523e60002000018",
          hero_section: {
            type: "image",
            caption: "<p>abcd abcd</p><svg/onload=alert(1)>",
          },
          lead_paragraph: "<p>abcd abcd</p><svg/onload=alert(1)>",
          sections: [
            {
              type: "text",
              body,
            },
            {
              type: "text",
              body: badBody,
            },
            {
              type: "image_collection",
              images: [
                {
                  type: "image",
                  caption: "<p>abcd abcd</p><svg/onload=alert(1)>",
                },
              ],
            },
            {
              type: "slideshow",
              items: [
                {
                  type: "image",
                  caption: "<p>abcd abcd</p><svg/onload=alert(1)>",
                },
              ],
            },
            {
              type: "embed",
              url: "maps.google.com",
              height: "400",
              mobile_height: "300",
            },
            {
              type: "social_embed",
              url: "some-link.com",
            },
          ],
        },
        "foo",
        {},
        (error, article) => {
          if (error) {
            done(error)
          }
          article.lead_paragraph.should.equal(
            '<p>abcd abcd</p>&lt;svg onload="alert(1)"/&gt;'
          )
          article.hero_section.caption.should.equal(
            '<p>abcd abcd</p>&lt;svg onload="alert(1)"/&gt;'
          )
          article.sections[0].body.should.equal(body)
          article.sections[1].body.should.equal(
            "&lt;script&gt;alert(foo)&lt;/script&gt;" + body
          )
          article.sections[2].images[0].caption.should.equal(
            '<p>abcd abcd</p>&lt;svg onload="alert(1)"/&gt;'
          )
          article.sections[3].items[0].caption.should.equal(
            '<p>abcd abcd</p>&lt;svg onload="alert(1)"/&gt;'
          )
          article.sections[4].url.should.equal("https://maps.google.com/")
          article.sections[4].height.should.equal("400")
          article.sections[4].mobile_height.should.equal("300")
          article.sections[5].url.should.equal("https://some-link.com/")
          done()
        }
      )
    })

    it("doesnt escape smart quotes", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          title: "Dr. Evil demands “one million dollars”.",
          thumbnail_title: "Dr. Evil demands “one billion dollars”.",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.title.should.containEql("“")
          article.thumbnail_title.should.containEql("“")
          done()
        }
      ))

    it("fixes anchors urls", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          sections: [
            {
              type: "text",
              body: '<a href="foo.com">Foo</a>',
            },
            {
              type: "text",
              body: '<a href="www.bar.com">Foo</a>',
            },
          ],
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.sections[0].body.should.equal(
            '<a href="https://foo.com/">Foo</a>'
          )
          article.sections[1].body.should.equal(
            '<a href="https://www.bar.com/">Foo</a>'
          )
          done()
        }
      ))

    it("retains non-text sections", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          sections: [
            {
              type: "text",
              body: '<a href="foo.com">Foo</a>',
            },
            {
              type: "image_collection",
              images: [
                {
                  type: "image",
                  url: "http://foo.com",
                },
              ],
            },
            {
              type: "video",
              url: "foo.com/watch",
            },
          ],
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.sections[0].body.should.equal(
            '<a href="https://foo.com/">Foo</a>'
          )
          article.sections[1].images[0].url.should.equal("http://foo.com")
          article.sections[2].url.should.equal("https://foo.com/watch")
          done()
        }
      ))

    it("maintains the original slug when publishing with a new title", done =>
      fabricate("users", { name: "Molly" }, (err, user) => {
        if (err) {
          done(err)
        }
        Article.save(
          {
            thumbnail_title: "Foo Baz",
            author_id: user._id.toString(),
            published: true,
            author: {
              name: user.name,
            },
          },
          "foo",
          {},
          (error, a) => {
            if (error) {
              done(error)
            }
            Article.save(
              {
                id: a._id.toString(),
                thumbnail_title: "Foo Bar Baz",
                author_id: user._id.toString(),
                published: true,
              },
              "foo",
              {},
              (e, article) => {
                if (e) {
                  done(e)
                }
                article.slugs.join("").should.equal("molly-foo-baz")
                article.thumbnail_title.should.equal("Foo Bar Baz")
                done()
              }
            )
          }
        )
      }))

    it("generates keywords on publish", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          primary_featured_artist_ids: ["4d8b92b34eb68a1b2c0003f4"],
          featured_artist_ids: ["52868347b202a37bb000072a"],
          fair_ids: ["5530e72f7261696238050000"],
          partner_ids: ["4f5228a1de92d1000100076e"],
          tags: ["cool", "art"],
          contributing_authors: [{ name: "kana" }],
          published: true,
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.keywords
            .join(",")
            .should.equal(
              "cool,art,Pablo Picasso,Pablo Picasso,Armory Show 2013,Gagosian Gallery,kana"
            )
          done()
        }
      ))

    it("indexes the article in elasticsearch on save", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          title: "foo article",
          published: true,
          channel_id: "5086df098523e60002000018",
        },
        "foo",
        {},
        (err, _article) => {
          if (err) {
            done(err)
          }
          setTimeout(
            () =>
              search.client.search(
                {
                  index: search.index,
                  q: "name:foo",
                },
                (error, response) => {
                  if (error) {
                    done(error)
                  }
                  response.hits.hits[0]._source.name.should.equal("foo article")
                  response.hits.hits[0]._source.visible_to_public.should.equal(
                    true
                  )
                  done()
                }
              ),
            2000
          )
        }
      ))

    it("saves Super Articles", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          is_super_article: true,
          super_article: {
            partner_link: "http://partnerlink.com",
            partner_logo: "http://partnerlink.com/logo.jpg",
            partner_fullscreen_header_logo:
              "http://partnerlink.com/blacklogo.jpg",
            partner_link_title: "Download The App",
            partner_logo_link: "http://itunes",
            secondary_partner_logo: "http://secondarypartner.com/logo.png",
            secondary_logo_text: "In Partnership With",
            secondary_logo_link: "http://secondary",
            footer_blurb: "This is a Footer Blurb",
            related_articles: ["5530e72f7261696238050000"],
            footer_title: "Footer Title",
          },
          published: true,
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.super_article.partner_link.should.equal(
            "http://partnerlink.com"
          )
          article.super_article.partner_logo.should.equal(
            "http://partnerlink.com/logo.jpg"
          )
          article.super_article.partner_link_title.should.equal(
            "Download The App"
          )
          article.super_article.partner_logo_link.should.equal("http://itunes")
          article.super_article.partner_fullscreen_header_logo.should.equal(
            "http://partnerlink.com/blacklogo.jpg"
          )
          article.super_article.secondary_partner_logo.should.equal(
            "http://secondarypartner.com/logo.png"
          )
          article.super_article.secondary_logo_text.should.equal(
            "In Partnership With"
          )
          article.super_article.secondary_logo_link.should.equal(
            "http://secondary"
          )
          article.super_article.footer_blurb.should.equal(
            "This is a Footer Blurb"
          )
          article.is_super_article.should.equal(true)
          article.super_article.related_articles.length.should.equal(1)
          article.super_article.footer_title.should.equal("Footer Title")
          done()
        }
      ))

    it("type casts ObjectId over articles", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          super_article: {
            related_articles: ["5530e72f7261696238050000"],
          },
          published: true,
          fair_programming_ids: ["52617c6c8b3b81f094000013"],
          fair_artsy_ids: ["53da550a726169083c0a0700"],
          fair_about_ids: ["53da550a726169083c0a0700"],
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          const related = article.super_article.related_articles[0]
          // @ts-ignore
          ;(article.author_id instanceof ObjectId).should.be.true()
          // @ts-ignore
          ;(related instanceof ObjectId).should.be.true()
          done()
        }
      ))

    it("saves a callout section", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          sections: [
            {
              type: "callout",
              text: "The Title Goes Here",
              article: "",
              thumbnail_url: "http://image.jpg",
              hide_image: false,
            },
            {
              type: "text",
              body: "badBody",
            },
            {
              type: "callout",
              text: "",
              article: "53da550a726169083c0a0700",
              thumbnail_url: "",
            },
            {
              type: "text",
              body: "badBody",
            },
          ],
          published: true,
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.sections[0].type.should.equal("callout")
          article.sections[0].text.should.equal("The Title Goes Here")
          article.sections[0].thumbnail_url.should.equal("http://image.jpg")
          article.sections[1].type.should.equal("text")
          article.sections[3].type.should.equal("text")
          article.sections[2].article.should.equal("53da550a726169083c0a0700")
          done()
        }
      ))

    it("saves an article that does not have sections in input", done =>
      fabricate(
        "articles",
        {
          _id: new ObjectId("5086df098523e60002000018"),
          id: "5086df098523e60002000018",
          author_id: new ObjectId("5086df098523e60002000018"),
          published: false,
          author: {
            name: "Kana Abe",
          },
          sections: [
            {
              type: "text",
              body: "The start of a new article",
            },
          ],
        },
        () =>
          Article.save(
            {
              _id: new ObjectId("5086df098523e60002000018"),
              id: "5086df098523e60002000018",
              author_id: "5086df098523e60002000018",
              published: true,
            },
            "foo",
            {},
            (err, article) => {
              if (err) {
                done(err)
              }
              article.published.should.be.true()
              article.sections.length.should.equal(1)
              article.sections[0].body.should.containEql(
                "The start of a new article"
              )
              done()
            }
          )
      ))

    it("saves an image set section", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          sections: [
            {
              type: "image_set",
              layout: "mini",
              title: "The Best Artworks",
              images: [
                {
                  type: "image",
                  url: "https://image.png",
                  caption: "Trademarked",
                },
                {
                  type: "artwork",
                  id: "123",
                  slug: "andy-warhol",
                  title: "The Piece",
                  date: "2015-04-01",
                  image: "http://image.png",
                  credit: "Credit Line",
                },
              ],
            },
          ],
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.sections[0].type.should.equal("image_set")
          article.sections[0].layout.should.equal("mini")
          article.sections[0].title.should.equal("The Best Artworks")
          article.sections[0].images[0].type.should.equal("image")
          article.sections[0].images[0].url.should.equal("https://image.png")
          article.sections[0].images[1].type.should.equal("artwork")
          article.sections[0].images[1].id.should.equal("123")
          article.sections[0].images[1].slug.should.equal("andy-warhol")
          article.sections[0].images[1].credit.should.equal("Credit Line")
          done()
        }
      ))

    it("saves social_embed sections", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          sections: [
            {
              type: "social_embed",
              layout: "column_width",
              url: "http://instagram.com/foo",
            },
          ],
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.sections[0].layout.should.equal("column_width")
          article.sections[0].url.should.equal("http://instagram.com/foo")
          article.sections[0].type.should.equal("social_embed")
          done()
        }
      ))

    it("saves layouts", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          layout: "feature",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.layout.should.equal("feature")
          done()
        }
      ))

    it("it defaults to classic if layout is not specified", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.layout.should.equal("classic")
          done()
        }
      ))

    it("saves the channel_id", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          channel_id: "5086df098523e60002000015",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.channel_id.toString().should.equal("5086df098523e60002000015")
          done()
        }
      ))

    it("saves the partner_channel_id", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          partner_channel_id: "5086df098523e60002000015",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.partner_channel_id
            .toString()
            .should.equal("5086df098523e60002000015")
          done()
        }
      ))

    it("saves the author", done =>
      Article.save(
        {
          author: {
            name: "Jon Snow",
            id: "5086df098523e60002000018",
          },
          author_id: "5086df098523e60002000018",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.author.id.toString().should.equal("5086df098523e60002000018")
          article.author.name.should.equal("Jon Snow")
          done()
        }
      ))

    it("saves the author_ids field", done =>
      Article.save(
        {
          author_ids: ["5086df098523e60002000018", "5086df098523e60002000015"],
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.author_ids[0]
            .toString()
            .should.equal("5086df098523e60002000018")
          article.author_ids[1]
            .toString()
            .should.equal("5086df098523e60002000015")
          done()
        }
      ))

    it("saves a description", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          channel_id: "5086df098523e60002000015",
          description:
            "Just before the lines start forming, we predict where they will go.",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.description.should.containEql("lines start forming")
          done()
        }
      ))

    it("saves a postscript", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          channel_id: "5086df098523e60002000015",
          postscript: "<p>Here is some text that follows an article.</p>",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.postscript.should.eql(
            "<p>Here is some text that follows an article.</p>"
          )
          done()
        }
      ))

    it("saves a media object", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          media: { duration: 1000 },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.media.duration.should.equal(1000)
          done()
        }
      ))

    it("saves a series description", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          series: {
            description: "<p>Here is some text describing a series.</p>",
          },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.series.description.should.equal(
            "<p>Here is some text describing a series.</p>"
          )
          done()
        }
      ))

    it("saves a series sub_title", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          series: {
            sub_title: "About this feature",
          },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.series.sub_title.should.equal("About this feature")
          done()
        }
      ))

    it("saves verticals", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          vertical: { name: "Culture", id: "4d8b92b34eb68a1b2c0003f4" },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.vertical.name.should.eql("Culture")
          done()
        }
      ))

    it("saves tracking_tags", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          tracking_tags: ["evergreen", "video"],
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.tracking_tags.should.eql(["evergreen", "video"])
          done()
        }
      ))

    it("saves social metadata", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          channel_id: "5086df098523e60002000015",
          social_title: "social title",
          social_description: "social description",
          social_image: "social image",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.social_title.should.containEql("social title")
          article.social_description.should.containEql("social description")
          article.social_image.should.containEql("social image")
          done()
        }
      ))

    it("saves search metadata", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          channel_id: "5086df098523e60002000015",
          search_title: "search title",
          search_description: "search description",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.search_title.should.containEql("search title")
          article.search_description.should.containEql("search description")
          done()
        }
      ))

    it("saves the seo_keyword", done =>
      Article.save(
        {
          author_id: "5086df098523e60002000018",
          seo_keyword: "focus",
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.seo_keyword.should.equal("focus")
          done()
        }
      ))
    it("saves a classic hero_section", done =>
      Article.save(
        {
          hero_section: {
            url: "http://youtube.com",
            type: "video",
            caption: "This year was incredible.",
          },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.hero_section.url.should.equal("http://youtube.com")
          article.hero_section.type.should.equal("video")
          article.hero_section.caption.should.equal("This year was incredible.")
          done()
        }
      ))

    it("saves a feature hero_section in fullscreen", done =>
      Article.save(
        {
          hero_section: {
            url: "http://image.com",
            type: "fullscreen",
            deck: "This year was incredible.",
          },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.hero_section.url.should.equal("http://image.com")
          article.hero_section.type.should.equal("fullscreen")
          article.hero_section.deck.should.equal("This year was incredible.")
          done()
        }
      ))

    it("saves a feature hero_section in text", done =>
      Article.save(
        {
          hero_section: {
            url: "http://image.com",
            type: "text",
            deck: "This year was incredible.",
          },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.hero_section.url.should.equal("http://image.com")
          article.hero_section.type.should.equal("text")
          article.hero_section.deck.should.equal("This year was incredible.")
          done()
        }
      ))

    it("saves a feature hero_section in split", done =>
      Article.save(
        {
          hero_section: {
            url: "http://image.com",
            type: "split",
            deck: "This year was incredible.",
          },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.hero_section.url.should.equal("http://image.com")
          article.hero_section.type.should.equal("split")
          article.hero_section.deck.should.equal("This year was incredible.")
          done()
        }
      ))

    it("saves a feature hero_section in basic", done =>
      Article.save(
        {
          hero_section: {
            url: "http://image.com",
            type: "basic",
            deck: "This year was incredible.",
            cover_image_url: "http://some-cover-image.png",
          },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.hero_section.url.should.equal("http://image.com")
          article.hero_section.type.should.equal("basic")
          article.hero_section.cover_image_url.should.equal(
            "http://some-cover-image.png"
          )
          done()
        }
      ))

    it("saves a series hero_section", done =>
      Article.save(
        {
          hero_section: {
            url: "http://image.com",
            type: "series",
          },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.hero_section.url.should.equal("http://image.com")
          article.hero_section.type.should.equal("series")
          done()
        }
      ))

    it("saves media", done =>
      Article.save(
        {
          media: {
            url: "https://media.artsy.net/video.mp4",
            cover_image_url: "https://media.artsy.net/images.jpg",
            duration: 1000,
            release_date: "2017-05-07 20:00:00.000",
            published: false,
            description: "<p>This video is about kittens.</p>",
            credits: "<p><b>Director</b><br>Marina Cashdan</p>",
          },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.media.url.should.equal("https://media.artsy.net/video.mp4")
          article.media.cover_image_url.should.equal(
            "https://media.artsy.net/images.jpg"
          )
          article.media.duration.should.equal(1000)
          article.media.release_date
            .toString()
            .should.containEql("Sun May 07 2017")
          article.media.published.should.equal(false)
          article.media.description.should.equal(
            "<p>This video is about kittens.</p>"
          )
          article.media.credits.should.equal(
            "<p><b>Director</b><br>Marina Cashdan</p>"
          )
          done()
        }
      ))

    it("saves a sponsor", done =>
      Article.save(
        {
          sponsor: {
            description: "<p>Here is some text describing a sponsor.</p>",
            sub_title: "About this sponsor",
            partner_dark_logo: "https://media.artsy.net/partner_dark_logo.jpg",
            partner_light_logo:
              "https://media.artsy.net/partner_light_logo.jpg",
            partner_condensed_logo:
              "https://media.artsy.net/partner_condensed_logo.jpg",
            partner_logo_link: "https://partner.com",
            pixel_tracking_code: "tracking_image.jpg",
          },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.sponsor.description.should.equal(
            "<p>Here is some text describing a sponsor.</p>"
          )
          article.sponsor.sub_title.should.equal("About this sponsor")
          article.sponsor.partner_dark_logo.should.equal(
            "https://media.artsy.net/partner_dark_logo.jpg"
          )
          article.sponsor.partner_light_logo.should.equal(
            "https://media.artsy.net/partner_light_logo.jpg"
          )
          article.sponsor.partner_condensed_logo.should.equal(
            "https://media.artsy.net/partner_condensed_logo.jpg"
          )
          article.sponsor.partner_logo_link.should.equal("https://partner.com")
          article.sponsor.pixel_tracking_code.should.equal("tracking_image.jpg")
          done()
        }
      ))

    it("saves a news_source", done =>
      Article.save(
        {
          news_source: {
            title: "The New York Times",
            url: "https://nytimes.com",
          },
        },
        "foo",
        {},
        (err, article) => {
          if (err) {
            done(err)
          }
          article.news_source.title.should.equal("The New York Times")
          article.news_source.url.should.equal("https://nytimes.com/")
          done()
        }
      ))
  })
})

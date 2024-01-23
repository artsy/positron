import moment from "moment"
import { ObjectId } from "mongodb"
import rewire from "rewire"
import sinon from "sinon"
import { times } from "underscore"
import * as Article from "../../model"
const { fabricate, empty } = require("../../../../test/helpers/db.coffee")
const Save = rewire("../../model/save.coffee")
const gravity = require("@artsy/antigravity").server
const app = require("express")()

describe("Save", () => {
  const sandbox = sinon.sandbox.create()
  let server
  let removeStopWords
  let indexForSearch
  // @ts-ignore
  before(done => {
    app.use("/__gravity", gravity)
    server = app.listen(5000, () => done())

    const date = new Date("Tue Jan 01 2019 00:00:00")
    sandbox.useFakeTimers(date)
  })

  // @ts-ignore
  after(() => {
    server.close()
    sandbox.restore()
  })

  beforeEach(done => {
    removeStopWords = Save.__get__("removeStopWords")

    Save.__set__("request", {
      post: sinon.stub().returns({
        send: sinon.stub().returns({
          end: sinon.stub().yields(),
        }),
      }),
    })
    Save.__set__("indexForSearch", (indexForSearch = sinon.stub()))

    empty(() => fabricate("articles", times(10, () => ({})), () => done()))
  })

  describe("#removeStopWords", () => {
    it("removes stop words from a string", done => {
      removeStopWords(
        "Why. the Internet Is Obsessed with These Videos of People Making Things"
      ).should.containEql("internet obsessed videos people making things")
      removeStopWords(
        "Heirs of Major Jewish Art Dealer Sue Bavaria over $20 Million of Nazi-Looted Art"
      ).should.containEql(
        "heirs major jewish art dealer sue bavaria 20 million nazi-looted art"
      )
      removeStopWords(
        "Helen Marten Wins UK’s Biggest Art Prize—and the 9 Other Biggest News Stories This Week"
      ).should.containEql("helen marten wins uks art prize 9 news stories week")
      done()
    })

    it("if all words are stop words, keep the title", done => {
      removeStopWords("I’ll be there").should.containEql("Ill be there")
      done()
    })
  })

  describe("#onPublish", () => {
    it("generates slugs and published_at if not present", done =>
      Save.onPublish(
        {
          thumbnail_title: "a title",
        },
        (err, article) => {
          if (err) {
            done(err)
          }
          article.slugs.length.should.equal(1)
          moment(article.published_at)
            .format("MM DD YYYY")
            // @ts-ignore
            .should.equal(moment().format("MM DD YYYY"))
          done()
        }
      ))

    it("does not generate published_at if scheduled", done =>
      Save.onPublish(
        {
          thumbnail_title: "a title",
          scheduled_publish_at: "2017-07-26T17:37:03.065Z",
          published_at: null,
        },
        (err, article) => {
          if (err) {
            done(err)
          }
          // @ts-ignore
          ;(article.published_at === null).should.be.true()
          done()
        }
      ))
  })

  describe("#generateSlugs", () => {
    it("generates a slug", done =>
      Save.generateSlugs(
        {
          thumbnail_title: "Clockwork",
          published: true,
          author: {
            name: "Molly",
          },
        },
        (err, article) => {
          if (err) {
            done(err)
          }
          article.slugs[0].should.equal("molly-clockwork")
          done()
        }
      ))

    it("appends a date to the slug if it exists in the database already", done =>
      Save.sanitizeAndSave(() =>
        Save.generateSlugs(
          {
            thumbnail_title: "Clockwork",
            published: true,
            author: {
              name: "Molly",
            },
            published_at: "2017-07-26T17:37:03.065Z",
          },
          (err, article) => {
            if (err) {
              done(err)
            }
            article.slugs[0].should.equal("molly-clockwork-07-26-17")
            done()
          }
        )
      )(null, {
        slugs: ["molly-clockwork"],
      }))

    it("does not append a date to the slug if it exists in the slugs array for that article already", done =>
      Save.sanitizeAndSave(() =>
        Save.generateSlugs(
          {
            thumbnail_title: "Clockwork",
            published: true,
            slugs: ["molly-clockwork"],
            author: {
              name: "Molly",
            },
            published_at: "2017-07-26T17:37:03.065Z",
          },
          (err, article) => {
            if (err) {
              done(err)
            }
            article.slugs.length.should.equal(1)
            article.slugs[0].should.equal("molly-clockwork")
            done()
          }
        )
      )(null, {
        slugs: ["molly-clockwork"],
      }))

    it("appends the current date to the slug if the slug exists in the database already but the date is invalid", done =>
      Save.sanitizeAndSave(() =>
        Save.generateSlugs(
          {
            thumbnail_title: "Clockwork",
            published: true,
            author: {
              name: "Molly",
            },
            published_at: "2017-07-dsdfdf26T17:37:03.065Zsdfdf",
          },
          (err, article) => {
            if (err) {
              done(err)
            }
            article.slugs[0].should.equal("molly-clockwork-01-01-19")
            done()
          }
        )
      )(null, {
        slugs: ["molly-clockwork"],
      }))

    it("appends the current date to the slug if the slug exists in the database already but there is no publish date", done =>
      Save.sanitizeAndSave(() =>
        Save.generateSlugs(
          {
            thumbnail_title: "Clockwork",
            published: true,
            author: {
              name: "Molly",
            },
          },
          (err, article) => {
            if (err) {
              done(err)
            }
            article.slugs[0].should.equal("molly-clockwork-01-01-19")
            done()
          }
        )
      )(null, {
        slugs: ["molly-clockwork"],
      }))

    it("moves the slug to the end of the slugs array and does not append a date if the slug is present elsewhere in the array", done =>
      Save.sanitizeAndSave(() =>
        Save.generateSlugs(
          {
            thumbnail_title: "Clockwork",
            published: true,
            author: {
              name: "Molly",
            },
            slugs: [
              "molly-clockwork",
              "molly-clockwork-2",
              "molly-clockwork-3",
            ],
            published_at: "2017-07-26T17:37:03.065Z",
          },
          (err, article) => {
            if (err) {
              done(err)
            }
            article.slugs.length.should.equal(3)
            article.slugs[article.slugs.length - 1].should.equal(
              "molly-clockwork"
            )
            done()
          }
        )
      )(null, {
        slugs: ["molly-clockwork"],
      }))

    it("does not append a date to the slug if a slug with that date exists in the slugs array for that article already", done =>
      Save.sanitizeAndSave(() =>
        Save.generateSlugs(
          {
            thumbnail_title: "Clockwork",
            published: true,
            author: {
              name: "Molly",
            },
            slugs: ["molly-clockwork-07-26-17"],
            published_at: "2017-07-26T17:37:03.065Z",
          },
          (err, article) => {
            if (err) {
              done(err)
            }
            article.slugs.length.should.equal(1)
            article.slugs[0].should.equal("molly-clockwork-07-26-17")
            done()
          }
        )
      )(null, {
        slugs: ["molly-clockwork"],
      }))

    it("it moves the slug with the appended date to the end of the slugs array if a slug with that date exists in the slugs array for that article already", done =>
      Save.sanitizeAndSave(() =>
        Save.generateSlugs(
          {
            thumbnail_title: "Clockwork",
            published: true,
            author: {
              name: "Molly",
            },
            slugs: [
              "molly-clockwork-2",
              "molly-clockwork-07-26-17",
              "molly-clockwork-3",
            ],
            published_at: "2017-07-26T17:37:03.065Z",
          },
          (err, article) => {
            if (err) {
              done(err)
            }
            article.slugs.length.should.equal(3)
            article.slugs[article.slugs.length - 1].should.equal(
              "molly-clockwork-07-26-17"
            )
            done()
          }
        )
      )(null, {
        slugs: ["molly-clockwork"],
      }))

    it("appends unix to the slug if it exists already and it is a draft", done =>
      Save.sanitizeAndSave(() =>
        Save.generateSlugs(
          {
            thumbnail_title: "Clockwork",
            published: false,
            author: {
              name: "Molly",
            },
            published_at: "2017-07-26T17:37:03.065Z",
          },
          (err, article) => {
            if (err) {
              done(err)
            }
            article.slugs[0].should.equal("molly-clockwork-1501090623")
            done()
          }
        )
      )(null, {
        slugs: ["molly-clockwork"],
      }))

    it("appends unix timestamp for current date to the slug if the slug exists already and it is a draft and there is no publish date", done => {
      // removing date offset to account for different timezones
      const now = new Date()
      const os = now.getTimezoneOffset()
      sandbox.clock.tick(os * -60000)

      Save.sanitizeAndSave(() =>
        Save.generateSlugs(
          {
            thumbnail_title: "Clockwork",
            published: false,
            author: {
              name: "Molly",
            },
          },
          (err, article) => {
            if (err) {
              done(err)
            }
            article.slugs[0].should.equal("molly-clockwork-1546300800")
            done()
          }
        )
      )(null, {
        slugs: ["molly-clockwork"],
      })
    })

    it("does not append author if it is series layout", done =>
      Save.generateSlugs(
        {
          thumbnail_title: "Clockwork",
          published: true,
          author: {
            name: "Molly",
          },
          layout: "series",
        },
        (err, article) => {
          if (err) {
            done(err)
          }
          article.slugs[0].should.equal("clockwork")
          done()
        }
      ))
  })

  describe("#onUnpublish", () => {
    it("generates slugs", done => {
      Save.onUnpublish(
        {
          thumbnail_title: "delete me a title",
          author_id: "5086df098523e60002000018",
          author: {
            name: "artsy editorial",
          },
          layout: "video",
        },
        (err, article) => {
          if (err) {
            done(err)
          }
          article.slugs.length.should.equal(1)
          done()
        }
      )
    })

    it("Regenerates the slug with stop words removed", done => {
      Save.onUnpublish(
        {
          thumbnail_title:
            "One New York Building Changed the Way Art Is Made, Seen, and Sold",
          author_id: "5086df098523e60002000018",
          author: {
            name: "artsy editorial",
          },
          layout: "feature",
        },
        (err, article) => {
          if (err) {
            done(err)
          }
          article.slugs.length.should.equal(1)
          done()
        }
      )
    })
  })

  describe("#sanitizeAndSave", () => {
    it("skips sanitizing links that do not have an href", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.sections[0].body.should.containEql("<a></a>")
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        sections: [
          {
            type: "text",
            body: "<a>",
          },
        ],
      }))

    it("sanitizes non artsy links", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.sections[0].body.should.containEql(
            '<a href="http://insecure-website.com/">link</a><a href="https://insecure-website.com/">link</a>'
          )
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        sections: [
          {
            type: "text",
            body:
              "<a href='http://insecure-website.com'>link</a><a href='insecure-website.com'>link</a>",
          },
        ],
      }))

    it("sanitizes www.artsy.net links", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.sections[0].body.should.containEql(
            '<a href="https://www.artsy.net/artist/andy-warhol">link</a>'
          )
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        sections: [
          {
            type: "text",
            body: "<a href='http://artsy.net/artist/andy-warhol'>link</a>",
          },
        ],
      }))

    it("sanitizes *.artsy.net links", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.sections[0].body.should.containEql(
            '<a href="https://folio.artsy.net/">link</a>'
          )
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        sections: [
          {
            type: "text",
            body: "<a href='http://folio.artsy.net'>link</a>",
          },
        ],
      }))

    it("sanitizes lead_paragraph", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.lead_paragraph.should.containEql(
            '<a href="https://insecure-website.com/">link</a><a href="https://www.artsy.net/artist/andy-warhol">artsy link</a>'
          )
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        lead_paragraph:
          '<a href="insecure-website.com">link</a><a href="http://artsy.net/artist/andy-warhol">artsy link</a>',
      }))

    it("sanitizes postscript", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.postscript.should.containEql(
            '<a href="https://insecure-website.com/">link</a><a href="https://www.artsy.net/artist/andy-warhol">artsy link</a>'
          )
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        postscript:
          '<a href="insecure-website.com">link</a><a href="http://artsy.net/artist/andy-warhol">artsy link</a>',
      }))

    it("sanitizes news_source", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.news_source.url.should.containEql(
            "https://www.artsy.net/artist/andy-warhol"
          )
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        news_source: {
          url: "http://artsy.net/artist/andy-warhol",
        },
      }))

    it("can save follow artist links (allowlist data-id)", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.sections[0].body.should.containEql(
            '<a data-id="andy-warhol"></a>'
          )
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        sections: [
          {
            type: "text",
            body: '<a data-id="andy-warhol"></a>',
          },
        ],
      }))

    it("can save layouts on text sections", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.sections[0].layout.should.eql("blockquote")
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        sections: [
          {
            type: "text",
            body: "<blockquote>Viva Art</blockquote>",
            layout: "blockquote",
          },
        ],
      }))

    it("indexes articles that are indexable", done => {
      Save.sanitizeAndSave(() => {
        Article.find("5086df098523e60002000011", (err, _article) => {
          if (err) {
            done(err)
          }
          indexForSearch.callCount.should.eql(1)
          done()
        })
      })(null, {
        indexable: true,
        published: true,
        _id: new ObjectId("5086df098523e60002000011"),
      })
    })

    it("skips indexing articles that are not indexable", done => {
      Save.sanitizeAndSave(() => {
        Article.find("5086df098523e60002000011", (err, _article) => {
          if (err) {
            done(err)
          }
          indexForSearch.callCount.should.eql(0)
          done()
        })
      })(null, {
        indexable: false,
        _id: new ObjectId("5086df098523e60002000011"),
      })
    })

    it("saves email metadata", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.email_metadata.image_url.should.containEql("foo.png")
          article.email_metadata.author.should.containEql("Kana")
          article.email_metadata.headline.should.containEql("Thumbnail Title")
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        thumbnail_title: "Thumbnail Title",
        thumbnail_image: "foo.png",
        scheduled_publish_at: "123",
        author: {
          name: "Kana",
        },
      }))

    it("does not override email metadata", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.email_metadata.image_url.should.containEql("bar.png")
          article.email_metadata.author.should.containEql("Artsy Editorial")
          article.email_metadata.headline.should.containEql("Custom Headline")
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        thumbnail_title: "Thumbnail Title",
        thumbnail_image: "foo.png",
        email_metadata: {
          image_url: "bar.png",
          author: "Artsy Editorial",
          headline: "Custom Headline",
        },
        scheduled_publish_at: "123",
      }))

    it("saves generated descriptions", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.description.should.containEql("Testing 123")
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        published: true,
        sections: [{ type: "text", body: "<p>Testing 123</p>" }],
      }))

    it("does not override description", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.description.should.containEql("Do not override me")
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        sections: [{ type: "text", body: "<p>Testing 123</p>" }],
        description: "Do not override me",
      }))

    it("Strips linebreaks from titles", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.title.should.containEql("A new title")
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        thumbnail_title: "Thumbnail Title",
        sections: [{ type: "text", body: "<p>Testing 123</p>" }],
        title: "A new title \n",
      }))

    it("saves media", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", (err, article) => {
          if (err) {
            done(err)
          }
          article.media.url.should.equal("https://media.artsy.net/video.mp4")
          article.media.cover_image_url.should.equal(
            "https://media.artsy.net/images.jpg"
          )
          article.media.duration.should.equal(1000)
          article.media.release_date.should.equal("2017-01-01")
          article.media.published.should.equal(false)
          article.media.description.should.equal(
            "<p>This video is about kittens.</p>"
          )
          article.media.credits.should.equal(
            "<p><b>Director</b><br>Marina Cashdan</p>"
          )
          done()
        })
      )(null, {
        _id: new ObjectId("5086df098523e60002000011"),
        media: {
          url: "https://media.artsy.net/video.mp4",
          cover_image_url: "https://media.artsy.net/images.jpg",
          duration: 1000,
          release_date: "2017-01-01",
          published: false,
          description: "<p>This video is about kittens.</p>",
          credits: "<p><b>Director</b><br>Marina Cashdan</p>",
        },
      }))
  })
})

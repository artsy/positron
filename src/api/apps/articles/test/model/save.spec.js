/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require("underscore")
const rewire = require("rewire")
const { fabricate, empty } = require("../../../../test/helpers/db")
const Save = rewire("../../model/save")
const Article = require("../../model/index")
const express = require("express")
const gravity = require("@artsy/antigravity").server
const app = require("express")()
const sinon = require("sinon")
const moment = require("moment")
const { ObjectId } = require("mongojs")

describe("Save", function() {
  const sandbox = sinon.sandbox.create()

  before(function(done) {
    app.use("/__gravity", gravity)
    this.server = app.listen(5000, () => done())

    const date = new Date("Tue Jan 01 2019 00:00:00")
    return sandbox.useFakeTimers(date)
  })

  after(function() {
    this.server.close()
    return sandbox.restore()
  })

  beforeEach(function(done) {
    this.removeStopWords = Save.__get__("removeStopWords")
    Save.__set__("request", {
      post: (this.post = sinon.stub()).returns({
        send: (this.send = sinon.stub()).returns({
          end: sinon.stub().yields(),
        }),
      }),
    })
    Save.__set__(
      "distributeArticle",
      (this.distributeArticle = sinon.stub().yields())
    )
    Save.__set__(
      "deleteArticleFromSailthru",
      (this.deleteArticleFromSailthru = sinon.stub().yields())
    )
    Save.__set__("indexForSearch", (this.indexForSearch = sinon.stub()))

    return empty(() =>
      fabricate("articles", _.times(10, () => ({})), () => done())
    )
  })

  describe("#removeStopWords", function() {
    it("removes stop words from a string", function(done) {
      this.removeStopWords(
        "Why. the Internet Is Obsessed with These Videos of People Making Things"
      ).should.containEql("internet obsessed videos people making things")
      this.removeStopWords(
        "Heirs of Major Jewish Art Dealer Sue Bavaria over $20 Million of Nazi-Looted Art"
      ).should.containEql(
        "heirs major jewish art dealer sue bavaria 20 million nazi-looted art"
      )
      this.removeStopWords(
        "Helen Marten Wins UK’s Biggest Art Prize—and the 9 Other Biggest News Stories This Week"
      ).should.containEql("helen marten wins uks art prize 9 news stories week")
      return done()
    })

    return it("if all words are stop words, keep the title", function(done) {
      this.removeStopWords("I’ll be there").should.containEql("Ill be there")
      return done()
    })
  })

  describe("#onPublish", function(done) {
    it("generates slugs and published_at if not present", done =>
      Save.onPublish(
        {
          thumbnail_title: "a title",
        },
        function(err, article) {
          article.slugs.length.should.equal(1)
          moment(article.published_at)
            .format("MM DD YYYY")
            .should.equal(moment().format("MM DD YYYY"))
          return done()
        }
      ))

    return it("does not generate published_at if scheduled", done =>
      Save.onPublish(
        {
          thumbnail_title: "a title",
          scheduled_publish_at: "2017-07-26T17:37:03.065Z",
          published_at: null,
        },
        function(err, article) {
          ;(article.published_at === null).should.be.true()
          return done()
        }
      ))
  })

  describe("#generateSlugs", function() {
    it("generates a slug", done =>
      Save.generateSlugs(
        {
          thumbnail_title: "Clockwork",
          published: true,
          author: {
            name: "Molly",
          },
        },
        function(err, article) {
          article.slugs[0].should.equal("molly-clockwork")
          return done()
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
          function(err, article) {
            article.slugs[0].should.equal("molly-clockwork-07-26-17")
            return done()
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
          function(err, article) {
            article.slugs.length.should.equal(1)
            article.slugs[0].should.equal("molly-clockwork")
            return done()
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
          function(err, article) {
            article.slugs[0].should.equal("molly-clockwork-01-01-19")
            return done()
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
          function(err, article) {
            article.slugs[0].should.equal("molly-clockwork-01-01-19")
            return done()
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
          function(err, article) {
            article.slugs.length.should.equal(3)
            article.slugs[article.slugs.length - 1].should.equal(
              "molly-clockwork"
            )
            return done()
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
          function(err, article) {
            article.slugs.length.should.equal(1)
            article.slugs[0].should.equal("molly-clockwork-07-26-17")
            return done()
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
          function(err, article) {
            article.slugs.length.should.equal(3)
            article.slugs[article.slugs.length - 1].should.equal(
              "molly-clockwork-07-26-17"
            )
            return done()
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
          function(err, article) {
            article.slugs[0].should.equal("molly-clockwork-1501090623")
            return done()
          }
        )
      )(null, {
        slugs: ["molly-clockwork"],
      }))

    it("appends unix timestamp for current date to the slug if the slug exists already and it is a draft and there is no publish date", function(done) {
      // removing date offset to account for different timezones
      const now = new Date()
      const os = now.getTimezoneOffset()
      sandbox.clock.tick(os * -60000)

      return Save.sanitizeAndSave(() =>
        Save.generateSlugs(
          {
            thumbnail_title: "Clockwork",
            published: false,
            author: {
              name: "Molly",
            },
          },
          function(err, article) {
            article.slugs[0].should.equal("molly-clockwork-1546300800")
            return done()
          }
        )
      )(null, {
        slugs: ["molly-clockwork"],
      })
    })

    return it("does not append author if it is series layout", done =>
      Save.generateSlugs(
        {
          thumbnail_title: "Clockwork",
          published: true,
          author: {
            name: "Molly",
          },
          layout: "series",
        },
        function(err, article) {
          article.slugs[0].should.equal("clockwork")
          return done()
        }
      ))
  })

  describe("#onUnpublish", function() {
    it("generates slugs and deletes article from sailthru", function(done) {
      return Save.onUnpublish(
        {
          thumbnail_title: "delete me a title",
          author_id: "5086df098523e60002000018",
          author: {
            name: "artsy editorial",
          },
          layout: "video",
        },
        (err, article) => {
          article.slugs.length.should.equal(1)
          this.deleteArticleFromSailthru.args[0][0].should.containEql(
            "video/artsy-editorial-delete-title"
          )
          return done()
        }
      )
    })

    return it("Regenerates the slug with stop words removed", function(done) {
      return Save.onUnpublish(
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
          article.slugs.length.should.equal(1)
          this.deleteArticleFromSailthru.args[0][0].should.containEql(
            "article/artsy-editorial-one-new-york-building-changed-way-art-made-seen-sold"
          )
          return done()
        }
      )
    })
  })

  return describe("#sanitizeAndSave", function() {
    it("skips sanitizing links that do not have an href", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", function(err, article) {
          article.sections[0].body.should.containEql("<a></a>")
          return done()
        })
      )(null, {
        _id: ObjectId("5086df098523e60002000011"),
        sections: [
          {
            type: "text",
            body: "<a>",
          },
        ],
      }))

    it("can save follow artist links (whitelist data-id)", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", function(err, article) {
          article.sections[0].body.should.containEql(
            '<a data-id="andy-warhol"></a>'
          )
          return done()
        })
      )(null, {
        _id: ObjectId("5086df098523e60002000011"),
        sections: [
          {
            type: "text",
            body: '<a data-id="andy-warhol"></a>',
          },
        ],
      }))

    it("can save layouts on text sections", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", function(err, article) {
          article.sections[0].layout.should.eql("blockquote")
          return done()
        })
      )(null, {
        _id: ObjectId("5086df098523e60002000011"),
        sections: [
          {
            type: "text",
            body: "<blockquote>Viva Art</blockquote>",
            layout: "blockquote",
          },
        ],
      }))

    it("indexes articles that are indexable", function(done) {
      return Save.sanitizeAndSave(() => {
        return Article.find("5086df098523e60002000011", (err, article) => {
          this.indexForSearch.callCount.should.eql(1)
          return done()
        })
      })(null, {
        indexable: true,
        _id: ObjectId("5086df098523e60002000011"),
      })
    })

    it("skips indexing articles that are not indexable", function(done) {
      return Save.sanitizeAndSave(() => {
        return Article.find("5086df098523e60002000011", (err, article) => {
          this.indexForSearch.callCount.should.eql(0)
          return done()
        })
      })(null, {
        indexable: false,
        _id: ObjectId("5086df098523e60002000011"),
      })
    })

    it("saves email metadata", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", function(err, article) {
          article.email_metadata.image_url.should.containEql("foo.png")
          article.email_metadata.author.should.containEql("Kana")
          article.email_metadata.headline.should.containEql("Thumbnail Title")
          return done()
        })
      )(null, {
        _id: ObjectId("5086df098523e60002000011"),
        thumbnail_title: "Thumbnail Title",
        thumbnail_image: "foo.png",
        scheduled_publish_at: "123",
        author: {
          name: "Kana",
        },
      }))

    it("does not override email metadata", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", function(err, article) {
          article.email_metadata.image_url.should.containEql("bar.png")
          article.email_metadata.author.should.containEql("Artsy Editorial")
          article.email_metadata.headline.should.containEql("Custom Headline")
          return done()
        })
      )(null, {
        _id: ObjectId("5086df098523e60002000011"),
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
        Article.find("5086df098523e60002000011", function(err, article) {
          article.description.should.containEql("Testing 123")
          return done()
        })
      )(null, {
        _id: ObjectId("5086df098523e60002000011"),
        published: true,
        sections: [{ type: "text", body: "<p>Testing 123</p>" }],
      }))

    it("does not override description", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", function(err, article) {
          article.description.should.containEql("Do not override me")
          return done()
        })
      )(null, {
        _id: ObjectId("5086df098523e60002000011"),
        sections: [{ type: "text", body: "<p>Testing 123</p>" }],
        description: "Do not override me",
      }))

    it("Strips linebreaks from titles", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", function(err, article) {
          article.title.should.containEql("A new title")
          return done()
        })
      )(null, {
        _id: ObjectId("5086df098523e60002000011"),
        thumbnail_title: "Thumbnail Title",
        sections: [{ type: "text", body: "<p>Testing 123</p>" }],
        title: "A new title \n",
      }))

    return it("saves media", done =>
      Save.sanitizeAndSave(() =>
        Article.find("5086df098523e60002000011", function(err, article) {
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
          return done()
        })
      )(null, {
        _id: ObjectId("5086df098523e60002000011"),
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

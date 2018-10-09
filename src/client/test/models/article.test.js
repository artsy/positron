import * as Article from "client/models/article.js"

describe("Article", () => {
  describe("#getArticleByline", () => {
    let article

    beforeEach(() => {
      article = {
        author: { id: "50f4367051e7956b6e00045d", name: "Artsy Editorial" },
        contributing_authors: [],
      }
    })

    it("Returns the author if no contributing authors", () => {
      const byline = Article.getArticleByline(article)
      expect(byline).toBe(article.author.name)
    })

    it("Returns a single contributing author", () => {
      article.contributing_authors.push({ id: "123", name: "Casey Lesser" })
      const byline = Article.getArticleByline(article)
      expect(byline).toBe(article.contributing_authors[0].name)
    })

    it("Returns a list of two contributing authors", () => {
      article.contributing_authors.push(
        { id: "123", name: "Casey Lesser" },
        { id: "234", name: "Molly Gottschalk" }
      )
      const byline = Article.getArticleByline(article)
      expect(byline).toBe("Casey Lesser and Molly Gottschalk")
    })

    it("Returns a list of two contributing authors", () => {
      article.contributing_authors.push(
        { id: "123", name: "Casey Lesser" },
        { id: "234", name: "Molly Gottschalk" },
        { id: "345", name: "Tess Thackara" }
      )
      const byline = Article.getArticleByline(article)
      expect(byline).toBe("Casey Lesser, Molly Gottschalk and Tess Thackara")
    })
  })

  describe("#getSlugsFromHTML", () => {
    it("Extracts a slug from an Artsy link", () => {
      const html = '<p><a href="http://artsy.net/artist/cy-twombly"></p>'
      const result = Article.getSlugsFromHTML(html, "artist")

      expect(result[0]).toBe("cy-twombly")
    })

    it("Extracts a slug from an Artsy link with query junk", () => {
      const html =
        '<p><a href="http://artsy.net/artist/cy-twombly?foo=bar"></p>'
      const result = Article.getSlugsFromHTML(html, "artist")

      expect(result[0]).toBe("cy-twombly")
    })

    it("Extracts a slug from an Artsy link with query junk", () => {
      const html =
        '<p><a href="https://www.google.com/url?q=https%3A%2F%2Fwww.artsy.net%2Fartist%2Ftrenton-doyle-hancock&sa=D&sntz=1"></p>'
      const result = Article.getSlugsFromHTML(html, "artist")

      expect(result[0]).toBe("trenton-doyle-hancock")
    })

    it("Extracts multiple slugs from an Artsy link", () => {
      const html =
        '<p><a href="http://artsy.net/artist/cy-twombly"><a href="https://www.google.com/url?q=https%3A%2F%2Fwww.artsy.net%2Fartist%2Ftrenton-doyle-hancock&sa=D&sntz=1"></p>'
      const result = Article.getSlugsFromHTML(html, "artist")

      expect(result[0]).toBe("cy-twombly")
      expect(result[1]).toBe("trenton-doyle-hancock")
    })
  })

  describe("#getMentionedArtistSlugs", () => {
    it("Finds artists mentioned in text and image sections", () => {
      let article = {
        sections: [
          {
            type: "image_collection",
            images: [
              { type: "artwork", artists: [{ id: "trenton-doyle-hancock" }] },
            ],
          },
          {
            type: "text",
            body:
              "<p><a href='artsy.net/artist/jutta-koether'>Jutta Koether</a></p>",
          },
          {
            type: "image_set",
            images: [
              {
                type: "image",
                caption:
                  "<p><a href='artsy.net/artist/cy-twombly'>Cy Twombly</a></p>",
              },
            ],
          },
        ],
      }
      let result = Article.getMentionedArtistSlugs(article)

      expect(result[0]).toBe("trenton-doyle-hancock")
      expect(result[1]).toBe("jutta-koether")
      expect(result[2]).toBe("cy-twombly")
    })
  })

  describe("#getMentionedArtworkSlugs", () => {
    it("Finds artworks mentioned in text and image sections", () => {
      let article = {
        sections: [
          {
            type: "image_collection",
            images: [{ type: "artwork", slug: "sam-moyer-untitled-29" }],
          },
          {
            type: "text",
            body: "<p><a href='artsy.net/artwork/gretta-johnson-untitled'></p>",
          },
          {
            type: "image_set",
            images: [
              {
                type: "image",
                caption:
                  "<p><a href='artsy.net/artwork/chip-hughes-stripes'></p>",
              },
            ],
          },
        ],
      }
      let result = Article.getMentionedArtworkSlugs(article)

      expect(result[0]).toBe("sam-moyer-untitled-29")
      expect(result[1]).toBe("gretta-johnson-untitled")
      expect(result[2]).toBe("chip-hughes-stripes")
    })
  })

  describe("#getContentStartEnd", () => {
    let article

    beforeEach(() => {
      article = {
        author: { id: "50f4367051e7956b6e00045d", name: "Artsy Editorial" },
        contributing_authors: [],
        sections: [
          { type: "text", body: "<p>Hello.</p>" },
          { type: "image_collection", images: [] },
          { type: "text", body: "<p>Hello.</p>" },
          { type: "image_collection", images: [] },
        ],
      }
    })
    it("Finds the first text section", () => {
      const startEnd = Article.getContentStartEnd(article)
      expect(startEnd.start).toBe(0)
    })

    it("Finds the last text section", () => {
      const startEnd = Article.getContentStartEnd(article)
      expect(startEnd.end).toBe(2)
    })
  })
})

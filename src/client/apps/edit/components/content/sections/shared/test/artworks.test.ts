import Backbone from "backbone"
import {
  fetchDenormalizedArtwork,
  filterArtworkSearchResults,
} from "../artworks"
const Artwork = require("client/models/artwork.coffee")

describe("shared/artworks", () => {
  const rawArtwork = {
    description: "Acrylic on glass",
    title: "Ryan Gander, Please be patient you two",
    type: "artwork",
    _id: "5698bc71275b2479120000a9",
    _links: {
      self: {
        href:
          "https://stagingapi.artsy.net/api/artworks/5698bc71275b2479120000a9",
      },
      thumbnail: {
        href: "https://d32dm0rphc51dk.cloudfront.net/square.jpg",
      },
    },
  }

  describe("#filterArtworkSearchResults", () => {
    it("formats artwork hits", () => {
      const [filtered] = filterArtworkSearchResults({
        _embedded: { results: [rawArtwork] },
      })

      expect(filtered).toEqual({
        _id: rawArtwork._id,
        title: rawArtwork.title,
        thumbnail_image: rawArtwork._links.thumbnail.href,
        type: "artwork",
      })
    })

    it("drops non-artwork hits", () => {
      const filtered = filterArtworkSearchResults({
        _embedded: {
          results: [
            rawArtwork,
            { type: "artist", _links: { self: { href: "x" } } },
          ],
        },
      })

      expect(filtered.length).toBe(1)
      expect(filtered[0].type).toBe("artwork")
    })
  })

  describe("#fetchDenormalizedArtwork", () => {
    const originalFetch = Backbone.Model.prototype.fetch
    const originalDenormalized = Artwork.prototype.denormalized

    afterEach(() => {
      Backbone.Model.prototype.fetch = originalFetch
      Artwork.prototype.denormalized = originalDenormalized
    })

    it("returns the denormalized artwork", async () => {
      const snapshot = { type: "artwork", id: "1", slug: "one" }
      Backbone.Model.prototype.fetch = jest.fn().mockReturnValueOnce({})
      Artwork.prototype.denormalized = jest.fn().mockReturnValueOnce(snapshot)

      expect(await fetchDenormalizedArtwork("1")).toBe(snapshot)
    })

    it("throws when the fetch fails", async () => {
      Backbone.Model.prototype.fetch = jest.fn(() => {
        throw new Error("not found")
      })

      await expect(fetchDenormalizedArtwork("1")).rejects.toThrow("not found")
    })
  })
})

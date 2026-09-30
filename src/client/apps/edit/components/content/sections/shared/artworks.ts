const Artwork = require("client/models/artwork.coffee")

export interface ArtworkSearchResult {
  _id: string
  title: string
  thumbnail_image?: string
  type: string
}

/** The subset of a Gravity `/api/search` hit that the autocomplete uses. */
export interface GravitySearchHit {
  type?: string
  title?: string
  _links: {
    self: { href: string }
    thumbnail?: { href: string }
  }
}

export interface GravitySearchResponse {
  _embedded: { results: GravitySearchHit[] }
}

/**
 * Maps a Gravity `/api/search` response to autocomplete items, keeping only
 * artworks.
 */
export const filterArtworkSearchResults = (
  response: GravitySearchResponse
): ArtworkSearchResult[] => {
  const results: ArtworkSearchResult[] = []

  response._embedded.results.forEach(item => {
    const { type, title, _links } = item

    if (type && type.toLowerCase() === "artwork") {
      const { thumbnail, self } = _links
      const _id = self.href.substr(self.href.lastIndexOf("/") + 1)

      results.push({
        _id,
        title: title || "",
        thumbnail_image: thumbnail && thumbnail.href,
        type,
      })
    }
  })

  return results
}

/**
 * Fetches an artwork from Gravity and returns the denormalized snapshot that
 * sections store (see Artwork#denormalized). Throws if the fetch fails.
 */
export const fetchDenormalizedArtwork = async (id: string) => {
  const artwork = await new Artwork({ id }).fetch()
  return new Artwork(artwork).denormalized()
}

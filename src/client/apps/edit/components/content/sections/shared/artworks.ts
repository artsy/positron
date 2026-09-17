const Artwork = require("client/models/artwork.coffee")

export interface ArtworkSearchResult {
  _id: string
  title: string
  thumbnail_image?: string
  type: string
}

/**
 * Maps a Gravity `/api/search` response to autocomplete items, keeping only
 * artworks. Non-artwork hits map to `false`, which Autocomplete compacts.
 */
export const filterArtworkSearchResults = (
  items: any
): Array<ArtworkSearchResult | false> => {
  return items._embedded.results.map(item => {
    const { type } = item

    if (type && type.toLowerCase() === "artwork") {
      const { title, _links } = item
      const { thumbnail, self } = _links
      const _id = self.href.substr(self.href.lastIndexOf("/") + 1)
      const thumbnail_image = thumbnail && thumbnail.href

      return {
        _id,
        title,
        thumbnail_image,
        type,
      }
    } else {
      return false
    }
  })
}

/**
 * Fetches an artwork from Gravity and returns the denormalized snapshot that
 * sections store (see Artwork#denormalized). Throws if the fetch fails.
 */
export const fetchDenormalizedArtwork = async (id: string) => {
  const artwork = await new Artwork({ id }).fetch()
  return new Artwork(artwork).denormalized()
}

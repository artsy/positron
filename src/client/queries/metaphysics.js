import { stringifyJSONForWeb } from "client/lib/utils/json"

export function ArtworkQuery(id) {
  return `
    {
      artwork(id: ${stringifyJSONForWeb(id)}) {
        _id
        title
      }
    }
  `
}

export function ArtworksQuery(ids) {
  return `
    {
      artworks(ids: ${stringifyJSONForWeb(ids)}) {
        _id
        title
      }
    }
  `
}

export function ArtistQuery(id) {
  return `
    {
      artist(id: ${stringifyJSONForWeb(id)}) {
        _id
        name
      }
    }
  `
}

export function ArtistsQuery(ids) {
  return `
    {
      artists(ids: ${stringifyJSONForWeb(ids)}) {
        _id
        name
      }
    }
  `
}

export function AuctionsQuery(ids) {
  return `
    {
      sales(ids: ${stringifyJSONForWeb(ids)}) {
        _id
        name
      }
    }
  `
}

export function FairsQuery(ids) {
  return `
    {
      fairs(ids: ${stringifyJSONForWeb(ids)}) {
        _id
        name
      }
    }
  `
}

export function PartnersQuery(ids) {
  return `
    {
      partners(ids: ${stringifyJSONForWeb(ids)}) {
        _id
        name
      }
    }
  `
}

export function PartnersConnectionQuery(ids) {
  return `
    {
      partnersConnection(ids: ${stringifyJSONForWeb(ids)}) {
        edges {
          node {
            internalID
            name
          }
        }
      }
    }
  `
}

export function ShowsQuery(ids) {
  return `
    {
      partner_shows(ids: ${stringifyJSONForWeb(ids)}) {
        _id
        name
      }
    }
  `
}

export function UsersQuery(ids) {
  return `
    {
      users(ids: ${stringifyJSONForWeb(ids)}) {
        id
        name
      }
    }
  `
}

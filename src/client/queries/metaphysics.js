import { stringifyJSONForWeb } from "client/lib/utils/json"

export function ArtworkQuery(id) {
  return `
    {
      artwork(id: ${stringifyJSONForWeb(id)}) {
        id
        title
      }
    }
  `
}

export function ArtworksQuery(ids) {
  return `
    {
      artworks(ids: ${stringifyJSONForWeb(ids)}) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `
}

export function ArtistQuery(id) {
  return `
    {
      artist(id: ${stringifyJSONForWeb(id)}) {
        id
        name
      }
    }
  `
}

export function ArtistsQuery(ids) {
  return `
    {
      artists(ids: ${stringifyJSONForWeb(ids)}) {
        id
        name
      }
    }
  `
}

export function AuctionsQuery(ids) {
  return `
    {
      salesConnection(ids: ${stringifyJSONForWeb(ids)}) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `
}

export function FairsQuery(ids) {
  return `
    {
      fairs(ids: ${stringifyJSONForWeb(ids)}) {
        id
        name
      }
    }
  `
}

export function PartnersQuery(ids) {
  // FIXME: should be deprecated
  return `
    {
      _unused_gravity_partners(ids: ${stringifyJSONForWeb(ids)}) {
        id
        displayName
      }
    }
  `
}

export function ShowsQuery(ids) {
  // FIXME: doesn't exist in v2
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

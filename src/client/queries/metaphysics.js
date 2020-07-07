import { stringifyJSONForWeb } from "client/lib/utils/json"

export function ArtworksQuery(ids) {
  return `
    {
      artworks(ids: ${stringifyJSONForWeb(ids)}) {
        edges {
          node {
            internalID
            title
          }
        }
      }
    }
  `
}

export function ArtistsQuery(ids) {
  return `
    {
      artists(ids: ${stringifyJSONForWeb(ids)}) {
        internalID
        name
      }
    }
  `
}

export function SalesConnectionQuery(ids) {
  return `
    {
      salesConnection(ids: ${stringifyJSONForWeb(ids)}) {
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

export function FairsQuery(ids) {
  return `
    {
      fairs(ids: ${stringifyJSONForWeb(ids)}) {
        internalID
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

export function ShowsConnectionQuery(ids) {
  return `
    {
      showsConnection(ids: ${stringifyJSONForWeb(ids)}) {
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

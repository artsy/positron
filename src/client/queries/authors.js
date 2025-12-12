import { stringifyJSONForWeb } from "client/lib/utils/json"

export function AuthorsQuery(ids) {
  return `
    {
      authors(ids: ${stringifyJSONForWeb(ids)}) {
        id
        name
        image_url
        role
        instagram_handle
        website
      }
    }
  `
}

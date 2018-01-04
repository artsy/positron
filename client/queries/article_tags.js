import { stringifyJSONForWeb } from 'client/lib/utils/json'

export function ArticleTagQuery (query) {
  return `
    {
      tags(q: ${stringifyJSONForWeb(query)}, strict: true) {
        id,
        name
      }
    }
  `
}

import { stringifyJSONForWeb } from 'client/lib/utils/json'

export function SubArticleQuery (ids) {
  return `
    {
      articles(ids: ${stringifyJSONForWeb(ids)}) {
        id
        title
      }
    }
  `
}

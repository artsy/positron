import { stringifyJSONForWeb } from 'client/lib/utils/json'

export function RelatedArticleQuery (ids) {
  return `
    {
      articles(ids: ${stringifyJSONForWeb(ids)}) {
        description
        media {
          duration
        }
        thumbnail_title
        thumbnail_image
        title
        slug
      }
    }
  `
}

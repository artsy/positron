import { stringifyJSONForWeb } from "client/lib/utils/json"

export function RelatedArticleQuery(ids) {
  return `
    {
      articles(ids: ${stringifyJSONForWeb(ids)}) {
        authors {
          name
          id
        }
        description
        id
        media {
          duration
          published
          release_date
        }
        thumbnail_title
        thumbnail_image
        title
        slug
      }
    }
  `
}

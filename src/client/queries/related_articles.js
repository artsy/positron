import { stringifyJSONForWeb } from "client/lib/utils/json"

export function RelatedArticleQuery(ids) {
  return `
    {
      articles(ids: ${stringifyJSONForWeb(ids)}) {
        authors {
          name
          id
        }
        author {
          name
        }
        description
        id
        layout
        media {
          duration
          published
          release_date
        }
        published_at
        thumbnail_title
        thumbnail_image
        title
        slug
      }
    }
  `
}

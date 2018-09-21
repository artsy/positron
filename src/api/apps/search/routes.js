import _ from "underscore"
import search from "api/lib/elasticsearch.coffee"
import { matchAll } from "api/apps/search/queries"
const { NODE_ENV } = process.env

// GET /api/search
export const index = (req, res, next) => {
  const env = NODE_ENV === "production" ? "production" : "staging"
  let index = ""
  if (req.query.type) {
    index = _.map(req.query.type.split(","), term => {
      return `${term}_${env}`
    }).join(",")
  }
  search.client.search(
    {
      index,
      body: {
        indices_boost: {
          artists_production: 4,
          tags_production: 3,
          partners_production: 2,
        },
        query: matchAll(req.query.term),
      },
    },
    (error, response) => {
      if (error) {
        return console.log(`nothing matched for: ${req.query.term}`)
      }
      return res.send(response.hits)
    }
  )
}

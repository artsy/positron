import search from 'api/lib/elasticsearch.coffee'
import { matchAll } from 'api/apps/search/queries'

// GET /api/search
export const index = (req, res, next) => {
  search.client.search({
    body: {
      query: matchAll(req.query.term)
    }},
    (error, response) => {
      if (error) {
        return console.log(`nothing matched for: ${req.query.term}`)
      }
      return res.send(response.hits)
    }
  )
}

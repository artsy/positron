import _ from 'underscore'
import search from 'api/lib/elasticsearch.coffee'
import { matchAll } from 'api/apps/search/queries'
const { NODE_ENV } = process.env

// GET /api/search
export const index = (req, res, next) => {
  const env = NODE_ENV === 'production' ? 'production' : 'staging'
  const index = _.map(req.query.type.split(','), term => {
    return `${term}_${env}`
  }).join(',')
  search.client.search({
    index,
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

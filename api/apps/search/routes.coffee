_ = require 'underscore'
search = require '../../lib/elasticsearch.coffee'


# GET /api/search
@index = (req, res, next) ->
  search.client.search(
      body:
        query: {
          bool: {
            must: {
              multi_match: {
                query: req.query.term,
                type: 'best_fields',
                fields: ['name.*', 'alternate_names.*'],
                fuzziness: 2
              }
            }
            should: {
              match_phrase: {
                name: req.query.term
              }
            }
          }
        }
      , (error, response) ->
        return console.log("nothing matched for: #{req.query.term}") if error
        res.send response.hits
    )

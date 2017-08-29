_ = require 'underscore'
search = require '../../lib/elasticsearch.coffee'
queries = require './queries.coffee'

# GET /api/search
@index = (req, res, next) ->
  search.client.search(
      body:
        query: queries.matchAll(req.query.term)
      , (error, response) ->
        return console.log("nothing matched for: #{req.query.term}") if error
        res.send response.hits
    )

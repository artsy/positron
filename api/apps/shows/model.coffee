#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "shows" resource.
#

_ = require 'underscore'
async = require 'async'
request = require 'superagent'
{ ARTSY_URL } = process.env

#
# Retrieval
#
@search = (query, accessToken, callback) ->
  request
    .get("#{ARTSY_URL}/api/search?q=#{query}")
    .set('X-Access-Token': accessToken)
    .end (err, res) ->
      return callback err if err
      slugs = for result in res.body._embedded.results when result.type is 'Show'
        href = result._links.self.href
        slug = _.last href.split('/')
      async.map slugs, (slug, cb) ->
        request
          .get("#{ARTSY_URL}/api/v1/show/#{slug}")
          .set('X-Access-Token': accessToken)
          .end (err, res) ->
            return cb err if err
            cb null, { id: res.body._id, value: res.body.name }
      , (err, results) ->
        return callback err if err
        callback null, results

@find = (id, accessToken, callback) ->
  request
    .get("#{ARTSY_URL}/api/v1/show/#{id}")
    .set('X-Access-Token': accessToken)
    .end (err, res) ->
      return callback err if err
      callback null, res.body

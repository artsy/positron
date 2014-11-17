#
# Helpers to DRY up common model operations (retrevial/domain logic) when
# interacting with the Artsy API.
#

_ = require 'underscore'
async = require 'async'
request = require 'superagent'
{ ARTSY_URL } = process.env

# Map curries into an image urls hash
#
# @param {Object} data Model data returned from endpoint
# @return {Object} hash of { large: 'http://foo.jpg' }

@imageUrlsFor = (data) ->
  imageUrls = {}
  for version in data.image_versions
    imageTempl = (curie.href for curie in data._links.curies when \
      curie.name is 'image')[0]
    imageUrls[version] = imageTempl.replace '{rel}', version + '.jpg'
  imageUrls

# Parallel fetches a single resource by ids
#
# @param {String} resource Resource name like 'artists'
# @param {Array} ids Array of ids
# @param {String} accessToken
# @param {Function} callback Calls back with (err, resoures)

@findByIds = (resource, ids, accessToken, callback) ->
  async.parallel (for id in ids
    ((id) ->
      (cb) ->
        request
          .get("#{ARTSY_URL}/api/#{resource}/#{id}")
          .set('X-Access-Token': accessToken)
          .end (err, res) -> cb err or res.error, res?.body
    )(id)
  ), callback

# Uses the search endpoint to pull out a set of slugs of a given type.
# Useful for scoped searches like finding artworks by title.
#
# @param {String} type e.g. "Artwork"
# @param {String} query
# @param {String} accessToken
# @param {Function} callback Calls back with (err, slugs)

@searchToSlugs = (type, query, accessToken, callback) =>
  request
    .get("#{ARTSY_URL}/api/search?q=#{query}")
    .set('X-Access-Token': accessToken)
    .end (err, res) =>
      return callback err if err
      results = res.body._embedded.results
      slugs = for result in results when result.type is type
        _.last result._links.self.href.split '/'
      callback null, slugs
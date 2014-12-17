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
  versions = data?.image_versions
  return null unless versions?.length
  for version in versions
    if data._links.thumbnail
      # Work around an API bug where the CDN is wrong
      url = data._links.thumbnail.href.split('/')
      url.pop()
      imageTempl = url.join('/') + '/{rel}'
    else
      imageTempl = (curie.href for curie in data._links.curies when \
        curie.name is 'image')[0]
    imageUrls[version] = imageTempl.replace '{rel}', version + '.jpg'
  imageUrls

# Parallel fetches a resource by ids
#
# @param {String} resource Resource name like 'artists'
# @param {Array} ids Array of ids
# @param {String} accessToken
# @param {Function} callback Calls back with (err, resoures)

@findByIds = (resource, ids, accessToken, callback) ->
  return callback null, [] unless ids?.length
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
      results = res.body._embedded?.results or []
      slugs = for result in results when result.type is type
        _.last result._links.self.href.split '/'
      callback null, slugs

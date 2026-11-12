#
# OpenSearch index lifecycle for the article search tests
#
search = require '../../lib/search_client'

module.exports.createArticlesIndex = (done) ->
  search.client.transport.request { method: 'PUT', path: "/#{search.index}" }, -> done?()

module.exports.deleteArticlesIndex = (done) ->
  search.client.indices.delete { index: search.index }, -> done?()

#
# Library of retrieval, persistance, validation, json views, and domain logic
# for the "artists" resource. Positron artists are simply Gravity artists that
# clean up some of the HAL stuff.
#
# e.g.
# {
#   id: ''
#   artist: { id: '', name: '', _links: [] }
#   image_urls: { large: 'http://stagic.artsy.net/images/1/large.jpg' }
# }
#

_ = require 'underscore'
async = require 'async'
{ ObjectId } = require 'mongojs'
{ imageUrlsFor, findByIds, searchToSlugs } = require '../../lib/artsy_model'

#
# Retrieval
#
@findByIds = (ids, accessToken, callback) ->
  findByIds 'artists', ids, accessToken, (err, artists) ->
    return callback err if err
    callback null, (for artist in artists
      id: artist.id
      artist: artist
      image_urls: imageUrlsFor(artist)
    )

@search = (query, accessToken, callback) ->
  searchToSlugs 'Artist', query, accessToken, (err, slugs) =>
    return callback err if err
    @findByIds slugs, accessToken, callback
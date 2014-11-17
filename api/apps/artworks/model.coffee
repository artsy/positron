#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "artworks" resource. Positron artworks are a compilation of Gravity
# artworks, their related data such as their artist and partner, and helpful
# data like their image url curies resolved.
#
# e.g.
# {
#   artwork: { id: '', title: '', _links: [] }
#   artists: [{ id: '', name: '', _links: [] }]
#   partner: { id: '', name: '', _links: [] }
#   image_urls: { large: 'http://stagic.artsy.net/images/1/large.jpg' }
# }
#

_ = require 'underscore'
async = require 'async'
request = require 'superagent'
{ ObjectId } = require 'mongojs'
{ ARTSY_URL } = process.env
{ imageUrlsFor, findByIds, searchToSlugs } = require '../../lib/artsy_model'

#
# Retrieval
#
@findByIds = (ids, accessToken, callback) ->

  # Parallel fetch each artwork
  findByIds 'artworks', ids, accessToken, (err, artworks) ->
    return callback err if err

    # Fetch each artwork's artists & partner
    async.parallel (for artwork in artworks
      ((artwork) ->
        (cb) ->
          requests = []
          requests.push(
            (cb) ->
              request
                .get(artwork._links.artists.href)
                .set('X-Access-Token': accessToken)
                .end (err, res) -> cb err, res?.body._embedded.artists
          ) if artwork._links.artists?
          requests.push(
            (cb) ->
              request
                .get(artwork._links.partner.href)
                .set('X-Access-Token': accessToken)
                .end (err, res) -> cb err, res?.body
          ) if artwork._links.partner?
          async.parallel requests, (err, [artists, partner]) ->

            # Finally callback with our compiled data
            cb err, {
              id: artwork.id
              artwork: artwork
              artists: artists
              partner: partner
              image_urls: imageUrlsFor(artwork)
            }
      )(artwork)
    ), (err, results) ->
      callback null, results

@search = (query, accessToken, callback) ->
  searchToSlugs 'Artwork', query, accessToken, (err, slugs) =>
    return callback err if err
    @findByIds slugs, accessToken, callback

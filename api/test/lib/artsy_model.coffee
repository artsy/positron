express = require 'express'
sinon = require 'sinon'
env = require 'node-env-file'
env __dirname + '../../../../.env.test'
am = require '../../lib/artsy_model'
{ fabricate2, server } = require 'antigravity'

app = express()
app.use '/__gravity', require('antigravity').server

describe 'artsy_model', ->

  beforeEach (done) ->
    @server = app.listen 5000, =>
      done()

  afterEach ->
    @server.close()

  describe '#imageUrlsFor', ->

    it 'it maps curies into image urls', ->
      am.imageUrlsFor(fabricate2('artwork')).large.should.containEql 'large.jpg'

    it 'it prefers the thumbnail base url b/c its more reliable', ->
      artwork = fabricate2('artwork')
      artwork._links.thumbnail.href = 'http://foo.com/bar/baz.jpg'
      am.imageUrlsFor(artwork).large.should.equal 'http://foo.com/bar/large.jpg'

  describe '#findByIds', ->

    it 'fetches a bunch of id endpoints in parallel', (done) ->
      am.findByIds 'artworks', ['foo', 'bar'], 'test-access-token', (err, res) ->
        res.length.should.equal 2
        res[0].title.should.equal 'Skull'
        done()

  describe '#searchToSlugs', ->

    it 'converts a query into slugs for that resource', (done) ->
      am.searchToSlugs 'Artwork', 'Warhol', 'test-access-token', (err, slugs) ->
        slugs.should.containEql 'andy-warhol-skull'
        done()

    it 'doesnt choke when theres no results', (done) ->
      am.searchToSlugs 'Artwork', 'NoResults', 'test-access-token', (err, slugs) ->
        slugs.length.should.equal 0
        done()
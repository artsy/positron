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
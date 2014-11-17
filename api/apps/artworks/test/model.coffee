_ = require 'underscore'
sinon = require 'sinon'
rewire = require 'rewire'
Artwork = rewire '../model'
express = require 'express'

app = express()
app.use '/__gravity', require('antigravity').server

describe 'Artwork', ->

  beforeEach (done) ->
    Artwork.__set__ 'ARTSY_URL', 'http://localhost:5000/__gravity'
    @server = app.listen 5000, =>
      done()

  afterEach ->
    @server.close()

  describe '#findByIds', ->

    it 'flattens & merges gravity Artwork data into a nicer format', (done) ->
      Artwork.findByIds [
        'andy-warhol-skull',
        'tracy-emin-humiliated'
      ], 'test-access-token', (err, artworks) ->
        artworks[0].artwork.title.should.equal 'Skull'
        artworks[0].artists[0].name.should.equal 'Andy Warhol'
        artworks[0].partner.name.should.equal 'Gagosian Gallery'
        artworks[0].image_urls.large.should.containEql 'large.jpg'
        done()

  describe '#search', ->

    it 'queries the search endpoint and expands it into artwork data', (done) ->
      Artwork.search 'Skull', 'test-access-token', (err, artworks) ->
        artworks[0].artwork.title.should.equal 'Skull'
        done()
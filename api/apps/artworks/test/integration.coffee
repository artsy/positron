_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'

describe 'users endpoints', ->

  beforeEach (done) ->
    fabricate 'users', {}, (err, @user) =>
      db.users.insert @user, (err, users) =>
        @server = app.listen 5000, ->
          console.log 'listening'
          done()

  afterEach (done) ->
    @server.close()
    empty -> done()

  describe 'GET /api/artworks', ->

    it 'returns some artworks by ids', (done) ->
      request
        .get("http://localhost:5000/artworks?ids[]=andy-warhol-skull")
        .set('X-Access-Token': @user.access_token)
        .end (err, res) =>
          artworks = res.body
          artworks[0].artwork.title.should.equal 'Skull'
          artworks[0].artists[0].name.should.equal 'Andy Warhol'
          artworks[0].partner.name.should.equal 'Gagosian Gallery'
          artworks[0].image_urls.large.should.containEql 'large.jpg'
          done()
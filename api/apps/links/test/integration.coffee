_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'

describe 'links endpoints', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {}, (err, @user) =>
        @server = app.listen 5000, ->
          done()

  afterEach ->
    @server.close()

  it 'gets a single link set by id', (done) ->
    fabricate 'links', [
      { slug: 'homepage', _id: ObjectId('55356a9deca560a0137aa4b7') }
      { slug: 'email-signup' }
    ], (err, links) =>
      request
        .get("http://localhost:5000/links/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          res.body.slug.should.equal 'homepage'
          done()

  it 'gets a list of link sets', (done) ->
    fabricate 'links', [
      { slug: 'homepage' }
      { slug: 'signup:artist' }
      { slug: 'signup:article' }
      { slug: 'signup:home' }
    ], (err, links) =>
      request
        .get("http://localhost:5000/links")
        .end (err, res) ->
          res.body.total.should.equal 4
          res.body.count.should.equal 4
          res.body.results[3].slug.should.equal 'homepage'
          res.body.results[2].slug.should.equal 'signup:artist'
          res.body.results[1].slug.should.equal 'signup:article'
          res.body.results[0].slug.should.equal 'signup:home'
          done()

  it 'gets a single link set by slug', (done) ->
    fabricate 'links', [
      { slug: 'homepage' }
      { slug: 'email-signup' }
    ], (err, links) =>
      request
        .get("http://localhost:5000/links?slug=email-signup")
        .end (err, res) ->
          res.body.total.should.equal 2
          res.body.count.should.equal 1
          res.body.results[0].slug.should.equal 'email-signup'
          done()

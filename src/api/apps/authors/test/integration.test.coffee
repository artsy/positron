_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
{ startServer, closeServer, url } = require '../../../test/helpers/server'
request = require 'superagent'
{ ObjectId } = require 'mongodb-legacy'

describe 'authors endpoints', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {}, (err, @user) =>
        startServer done

  afterEach (done) ->
    closeServer done

  it 'gets a list of authors', (done) ->
    fabricate 'authors', [
      { name: 'Alex' }
      { name: 'Molly' }
      {}
    ], (err, authors) ->
      request
        .get(url("/authors?count=true"))
        .end (err, res) ->
          res.body.total.should.equal 3
          res.body.count.should.equal 3
          res.body.results[2].name.should.equal 'Alex'
          done()

  it 'gets a list of authors by query', (done) ->
    fabricate 'authors', [
      { name: 'Alex' }
      { name: 'Molly' }
      {}
    ], (err, authors) ->
      request
        .get(url("/authors?q=Alex&count=true"))
        .end (err, res) ->
          res.body.total.should.equal 3
          res.body.count.should.equal 1
          res.body.results[0].name.should.equal 'Alex'
          done()

  it 'gets a single author', (done) ->
    fabricate 'authors', [
      {
        _id: new ObjectId('55356a9deca560a0137aa4b7')
        name: 'Alex'
      }
    ], (err, sections) ->
      request
        .get(url("/authors/55356a9deca560a0137aa4b7"))
        .end (err, res) ->
          res.body.name.should.equal 'Alex'
          done()
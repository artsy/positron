_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'

describe 'authors endpoints', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {}, (err, @user) =>
        @server = app.listen 5000, ->
          done()

  afterEach ->
    @server.close()

  it 'gets a list of authors', (done) ->
    fabricate 'authors', [
      { name: 'Alex' }
      { name: 'Molly' }
      {}
    ], (err, tags) ->
      request
        .get("http://localhost:5000/authors?count=true")
        .end (err, res) ->
          res.body.total.should.equal 3
          res.body.count.should.equal 3
          res.body.results[2].name.should.equal 'Alex'
          done()

  it 'gets a single author', (done) ->
    fabricate 'authors', [
      {
        _id: ObjectId('55356a9deca560a0137aa4b7')
        name: 'Alex'
      }
    ], (err, sections) ->
      request
        .get("http://localhost:5000/authors/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          res.body.name.should.equal 'Alex'
          done()
_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'

describe 'verticals endpoints', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {}, (err, @user) =>
        @server = app.listen 5000, ->
          console.log 'listening'
          done()

  afterEach ->
    @server.close()

  it 'gets a list of verticals by query', (done) ->
    fabricate 'verticals', [
      { title: 'Miami Basel' }
      { title: 'Foobar' }
      {}
    ], (err, verticals) =>
      request
        .get("http://localhost:5000/verticals?q=Miami Basel")
        .end (err, res) ->
          res.body.total.should.equal 3
          res.body.count.should.equal 1
          res.body.results[0].title.should.equal 'Miami Basel'
          done()

  it 'gets a single vertical', (done) ->
    fabricate 'verticals', [
      {
        _id: ObjectId('55356a9deca560a0137aa4b7')
        title: 'Cat Season in the Art World'
      }
    ], (err, verticals) =>
      request
        .get("http://localhost:5000/verticals/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          res.body.title.should.equal 'Cat Season in the Art World'
          done()

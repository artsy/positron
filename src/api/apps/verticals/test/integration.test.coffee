_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongodb-legacy'

describe 'verticals endpoints', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {}, (err, @user) =>
        @server = app.listen 5001, ->
          done()

  afterEach ->
    @server.close()

  it 'gets a list of verticals by query', (done) ->
    fabricate 'verticals', [
      { name: 'Art Market' }
      { name: 'Creativity' }
      {}
    ], (err, verticals) ->
      request
        .get("http://localhost:5001/verticals?q=Art Market&count=true")
        .end (err, res) ->
          res.body.total.should.equal 3
          res.body.count.should.equal 1
          res.body.results[0].name.should.equal 'Art Market'
          done()

  it 'gets a single vertical', (done) ->
    fabricate 'verticals', [
      {
        _id: new ObjectId('55356a9deca560a0137aa4b7')
        name: 'Art Market'
      }
    ], (err, sections) ->
      request
        .get("http://localhost:5001/verticals/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          res.body.name.should.equal 'Art Market'
          done()

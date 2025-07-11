_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
{ getAvailablePort } = require '../../../test/helpers/port'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongodb-legacy'

describe 'verticals endpoints', ->

  beforeEach (done) ->
    empty (emptyErr) =>
      return done(emptyErr) if emptyErr
      getAvailablePort (portErr, port) =>
        return done(portErr) if portErr
        @port = port
        @server = app.listen @port, ->
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
        .get("http://localhost:#{@port}/verticals?q=Art Market&count=true")
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
        .get("http://localhost:#{@port}/verticals/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          res.body.name.should.equal 'Art Market'
          done()

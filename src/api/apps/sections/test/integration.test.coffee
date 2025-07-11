_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
{ getAvailablePort } = require '../../../test/helpers/port'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongodb-legacy'

describe 'sections endpoints', ->

  port = null
  server = null

  beforeEach (done) ->
    empty (emptyErr) ->
      return done(emptyErr) if emptyErr
      getAvailablePort (portErr, p) ->
        return done(portErr) if portErr
        port = p
        server = app.listen port, ->
          done()

  afterEach ->
    server.close()

  it 'gets a list of sections by query', (done) ->
    fabricate 'sections', [
      { title: 'Miami Basel' }
      { title: 'Foobar' }
      {}
    ], (err, sections) =>
      request
        .get("http://localhost:#{port}/sections?q=Miami Basel")
        .end (err, res) ->
          return done(err) if err
          res.body.total.should.equal 3
          res.body.count.should.equal 1
          res.body.results[0].title.should.equal 'Miami Basel'
          done()

  it 'gets a single section', (done) ->
    fabricate 'sections', [
      {
        _id: new ObjectId('55356a9deca560a0137aa4b7')
        title: 'Cat Season in the Art World'
      }
    ], (err, sections) =>
      request
        .get("http://localhost:#{port}/sections/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          return done(err) if err
          res.body.title.should.equal 'Cat Season in the Art World'
          done()

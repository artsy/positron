_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
{ getAvailablePort } = require '../../../test/helpers/port'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongodb-legacy'

describe 'sections endpoints', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {}, (err, @user) =>
        getAvailablePort (err, port) =>
          return done(err) if err
          @port = port
          @server = app.listen @port, ->
            done()

  afterEach ->
    @server.close()

  it 'gets a list of sections by query', (done) ->
    fabricate 'sections', [
      { title: 'Miami Basel' }
      { title: 'Foobar' }
      {}
    ], (err, sections) =>
      request
        .get("http://localhost:#{@port}/sections?q=Miami Basel")
        .end (err, res) ->
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
        .get("http://localhost:#{@port}/sections/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          res.body.title.should.equal 'Cat Season in the Art World'
          done()

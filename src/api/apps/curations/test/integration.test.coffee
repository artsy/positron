_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
{ getAvailablePort } = require '../../../test/helpers/port'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongodb-legacy'

describe 'curations endpoints', ->

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

  it 'gets a single curation by id', (done) ->
    fabricate 'curations', [
      { name: 'Homepage', _id: new ObjectId('55356a9deca560a0137aa4b7') }
      { name: 'Email Signups' }
    ], (err, curation) =>
      request
        .get("http://localhost:#{port}/curations/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          return done(err) if err
          res.body.name.should.equal 'Homepage'
          done()

  it 'gets a list of curations', (done) ->
    fabricate 'curations', [
      { name: 'Homepage' }
      { name: 'Email Signups' }
      { name: 'Artist Page' }
      { name: 'About Page' }
    ], (err, curations) =>
      request
        .get("http://localhost:#{port}/curations")
        .end (err, res) ->
          return done(err) if err
          res.body.total.should.equal 4
          res.body.count.should.equal 4
          res.body.results[3].name.should.equal 'Homepage'
          res.body.results[2].name.should.equal 'Email Signups'
          res.body.results[1].name.should.equal 'Artist Page'
          res.body.results[0].name.should.equal 'About Page'
          done()

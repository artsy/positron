_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
{ getAvailablePort } = require '../../../test/helpers/port'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongodb-legacy'

describe 'channels endpoints', ->

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

  it 'gets a single channel', (done) ->
    fabricate 'channels', [
      {
        _id: new ObjectId('55356a9deca560a0137aa4b7')
        name: 'Life At Artsy'
      }
    ], (err, channels) =>
      request
        .get("http://localhost:#{@port}/channels/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          res.body.name.should.equal 'Life At Artsy'
          done()

_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
{ TEST_PORT } = require '../../../test/helpers/config'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongodb'

describe 'channels endpoints', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {}, (err, @user) =>
        @server = app.listen TEST_PORT, ->
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
        .get("http://localhost:#{TEST_PORT}/channels/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          res.body.name.should.equal 'Life At Artsy'
          done()

_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
{ getAvailablePort } = require '../../../test/helpers/port'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongodb-legacy'

describe 'GET /api/users/me', ->

  beforeEach (done) ->
    @token = fixtures().users.access_token
    fabricate 'users', {}, (err, @user) =>
      getAvailablePort (err, port) =>
        return done(err) if err
        @port = port
        @server = app.listen @port, ->
          done()

  afterEach (done) ->
    @server.close()
    empty -> done()

  it 'returns yourself', (done) ->
    request
      .get("http://localhost:#{@port}/users/me")
      .set('X-Access-Token': @token)
      .end (err, res) =>
        res.body.name.should.equal @user.name
        done()
    return

describe 'GET /api/users/me/refresh', ->

  beforeEach (done) ->
    @token = fixtures().users.access_token
    fabricate 'users', {
      name: 'Outdated Name',
      partner_ids: ['123']
    }, (err, @user) =>
      getAvailablePort (err, port) =>
        return done(err) if err
        @port = port
        @server = app.listen @port, ->
          done()

  afterEach (done) ->
    @server.close()
    empty -> done()

  it 'returns yourself, updated', (done) ->
    request
      .get("http://localhost:#{@port}/users/me/refresh")
      .set('X-Access-Token': @token)
      .end (err, res) =>
        res.body.name.should.equal 'Craig Spaeth'
        done()
    return

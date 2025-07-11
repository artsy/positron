_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
{ getAvailablePort } = require '../../../test/helpers/port'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongodb-legacy'

describe 'GET /api/users/me', ->

  token = null
  user = null
  port = null
  server = null

  beforeEach (done) ->
    token = fixtures().users.access_token
    fabricate 'users', {}, (fabricateErr, u) ->
      return done(fabricateErr) if fabricateErr
      user = u
      getAvailablePort (portErr, p) ->
        return done(portErr) if portErr
        port = p
        server = app.listen port, ->
          done()

  afterEach (done) ->
    server.close()
    empty -> done()

  it 'returns yourself', (done) ->
    request
      .get("http://localhost:#{port}/users/me")
      .set('X-Access-Token': token)
      .end (err, res) ->
        return done(err) if err
        res.body.name.should.equal user.name
        done()
    return

describe 'GET /api/users/me/refresh', ->

  token = null
  user = null
  port = null
  server = null

  beforeEach (done) ->
    token = fixtures().users.access_token
    fabricate 'users', {
      name: 'Outdated Name',
      partner_ids: ['123']
    }, (fabricateErr, u) ->
      return done(fabricateErr) if fabricateErr
      user = u
      getAvailablePort (portErr, p) ->
        return done(portErr) if portErr
        port = p
        server = app.listen port, ->
          done()

  afterEach (done) ->
    server.close()
    empty -> done()

  it 'returns yourself, updated', (done) ->
    request
      .get("http://localhost:#{port}/users/me/refresh")
      .set('X-Access-Token': token)
      .end (err, res) ->
        return done(err) if err
        res.body.name.should.equal 'Craig Spaeth'
        done()
    return
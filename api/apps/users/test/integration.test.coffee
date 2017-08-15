_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'

describe 'GET /api/users/me', ->

  beforeEach (done) ->
    fabricate 'users', {}, (err, @user) =>
      @server = app.listen 5000, ->
        done()

  afterEach (done) ->
    @server.close()
    empty -> done()

  it 'returns yourself', (done) ->
    request
      .get("http://localhost:5000/users/me")
      .set('X-Access-Token': @user.access_token)
      .end (err, res) =>
        res.body.name.should.equal @user.name
        done()
    return

describe 'GET /api/users/me/refresh', ->

  beforeEach (done) ->
    fabricate 'users', { name: 'Outdated Name', partner_ids: ['123'], access_token: 'foo' }, (err, @user) =>
      @server = app.listen 5000, ->
        done()

  afterEach (done) ->
    @server.close()
    empty -> done()

  it 'returns yourself, updated', (done) ->
    request
      .get("http://localhost:5000/users/me")
      .set('X-Access-Token': @user.access_token)
      .end (err, res) =>
        res.body.name.should.equal 'Craig Spaeth'
        done()
    return

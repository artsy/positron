_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
# Pinned to port 5000: the users model self-calls antigravity at ARTSY_URL
# (http://localhost:5000/__gravity), captured at module load.
{ startServer, closeServer, url } = require '../../../test/helpers/server'
request = require 'superagent'
{ ObjectId } = require 'mongodb-legacy'

describe 'GET /api/users/me', ->

  beforeEach (done) ->
    @token = fixtures().users.access_token
    fabricate 'users', {}, (err, @user) =>
      startServer 5000, done

  afterEach (done) ->
    closeServer -> empty -> done()

  it 'returns yourself', (done) ->
    request
      .get(url("/users/me"))
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
      startServer 5000, done

  afterEach (done) ->
    closeServer -> empty -> done()

  it 'returns yourself, updated', (done) ->
    request
      .get(url("/users/me/refresh"))
      .set('X-Access-Token': @token)
      .end (err, res) =>
        res.body.name.should.equal 'Craig Spaeth'
        done()
    return

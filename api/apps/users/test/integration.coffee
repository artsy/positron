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
        res.body.name.should.equal @user.name
        done()

    request
      .get("http://localhost:5000/users/me/refresh")
      .set('X-Access-Token': @user.access_token)
      .end (err, res) =>
        res.body.name.should.equal 'Craig Spaeth'
        res.body.partner_ids[0].should.equal '5086df098523e60002000012'
        done()

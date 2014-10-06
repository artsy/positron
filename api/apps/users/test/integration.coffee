_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'

describe 'users endpoints', ->

  beforeEach (done) ->
    fabricate 'users', {}, (err, @user) =>
      db.users.insert @user, (err, users) =>
        @server = app.listen 5000, ->
          console.log 'listening'
          done()

  afterEach (done) ->
    @server.close()
    empty -> done()

  describe 'GET /api/users/me', ->

    it 'returns yourself', (done) ->
      request
        .get("http://localhost:5000/users/me")
        .set('X-Access-Token': @user.access_token)
        .end (err, res) =>
          res.body.name.should.equal @user.name
          done()

  describe 'DELETE /api/users/me', ->

    it 'deletes yourself', (done) ->
      request
        .del("http://localhost:5000/users/me")
        .set('X-Access-Token': @user.access_token)
        .end (err, res) =>
          db.users.count (err, count) ->
            count.should.equal 0
            done()
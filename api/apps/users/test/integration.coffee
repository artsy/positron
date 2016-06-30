_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'

describe 'user endpoints', ->

  beforeEach (done) ->
    fabricate 'users', {}, (err, @user) =>
      @server = app.listen 5000, ->
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

_ = require 'underscore'
sinon = require 'sinon'
rewire = require 'rewire'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
User = rewire '../model'
{ ObjectId } = require 'mongojs'
express = require 'express'

app = express()
app.use '/__gravity', require('antigravity').server

describe 'User', ->

  beforeEach (done) ->
    empty =>
      User.__set__ 'ARTSY_URL', 'http://localhost:5000/__gravity'
      @server = app.listen 5000, =>
        done()

  afterEach ->
    @server.close()

  describe '#fromAccessToken', ->

    it 'flattens & merges gravity user data into a nicer format', (done) ->
      User.fromAccessToken 'foobar', (err, user) ->
        user.name.should.equal 'Craig Spaeth'
        user.access_token.should.equal 'foobar'
        user.details.type.should.equal 'Admin'
        done()

    it 'pieces together the icon url', (done) ->
      User.fromAccessToken 'foobar', (err, user) ->
        user.icon_url.should.match /// profile_icons/.*/square140.jpg ///
        done()

  describe '#destroyFromAccessToken', ->

    it 'removes the user thats been fetched', (done) ->
      db.users.insert _.extend(fixtures().users, access_token: 'foobar'), (err) ->
        User.destroyFromAccessToken 'foobar', (err) ->
          db.users.count (err, count) ->
            count.should.equal 0
            done()

  describe '#present', ->

    it 'converts _id to id', ->
      data = User.present _.extend fixtures().users, _id: 'foo'
      (data._id?).should.not.be.ok
      data.id.should.equal 'foo'
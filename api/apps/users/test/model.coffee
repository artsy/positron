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
        done()

  describe '#findOrInsert', ->

    it 'inserts a non-existing user', (done) ->
      User.findOrInsert '4d8cd73191a5c50ce200002a', 'foobar', (err, user) ->
        db.users.findOne (err, user) ->
          user.name.should.equal 'Craig Spaeth'
          done()

    it 'finds an existing user', (done) ->
      user = fixtures().users
      db.users.insert user, ->
        User.findOrInsert user.id, 'foobar', (err, user) ->
          user.name.should.equal 'Craig Spaeth'
          done()

  describe '#present', ->

    it 'converts _id to id', ->
      data = User.present _.extend fixtures().users, _id: 'foo'
      (data._id?).should.not.be.ok
      data.id.should.equal 'foo'
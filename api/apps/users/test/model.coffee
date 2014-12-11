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
        user.user.name.should.equal 'Craig Spaeth'
        user.access_token.should.equal 'foobar'
        user.details.type.should.equal 'Admin'
        done()

    it 'pieces together the icon url', (done) ->
      User.fromAccessToken 'foobar', (err, user) ->
        _.values(user.icon_urls)[0].should.match '/assets/shared/square140.jpg'
        done()

  describe '#present', ->

    it 'converts _id to id', ->
      data = User.present _.extend fixtures().users, _id: 'foo'
      (data._id?).should.not.be.ok
      data.id.should.equal 'foo'

  describe '#search', ->

    it 'regex searches by name', (done) ->
      fabricate 'users', { user: name: 'Molly' }, ->
        User.search 'molly', (err, users) ->
          users[0].user.name.should.equal 'Molly'
          done()

  describe '#save', ->

    it 'updates a users access token', (done) ->
      fabricate 'users', { _id: ObjectId(fixtures().users.id) }, ->
        User.save { id: fixtures().users.id, access_token: 'foo' }, (err, user) ->
          user.access_token.should.equal 'foo'
          done()


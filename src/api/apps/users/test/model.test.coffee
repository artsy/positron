_ = require 'underscore'
sinon = require 'sinon'
rewire = require 'rewire'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
User = rewire '../model'
{ ObjectId } = require 'mongodb'
gravity = require('@artsy/antigravity').server
gravityFabricate = require('@artsy/antigravity').fabricate
express = require 'express'

app = express()
app.get '/__gravity/api/v1/user/563d08e6275b247014000026', (req, res, next) ->
  user = gravityFabricate 'user', type: 'User', id: '563d08e6275b247014000026'
  res.send user
app.use '/__gravity', gravity

describe 'User', ->

  beforeEach (done) ->
    empty =>
      User.__set__ 'ARTSY_URL', 'http://localhost:5000/__gravity'
      User.__set__ 'jwtDecode', @jwtDecode = sinon.stub().returns({
        partner_ids: ['5086df098523e60002000012']
      })
      fabricate 'channels', { id: '5086df098523e60002000018' }, (err, @channel) =>
        @server = app.listen 5000, ->
          done()

  afterEach ->
    @server.close()

  describe '#fromAccessToken', ->

    it 'flattens & merges gravity user data into a nicer format', (done) ->
      User.fromAccessToken 'foobar', (err, user) ->
        user.name.should.equal 'Craig Spaeth'
        done()

    it 'gets partner_ids', (done) ->
      User.fromAccessToken 'foobar', (err, user) ->
        user.partner_ids[0].toString().should.equal '5086df098523e60002000012'
        done()

    it 'inserts a non-existing user', (done) ->
      User.fromAccessToken 'foobar', (err, user) ->
        db.users.findOne (err, user) ->
          user.name.should.equal 'Craig Spaeth'
          done()

    it 'finds an existing user', (done) ->
      user = fixtures().users
      db.users.insert user, ->
        User.fromAccessToken 'foobar', (err, user) ->
          user.name.should.equal 'Craig Spaeth'
          done()

    it 'returns the user if partner_ids have not changed', (done) ->
      user = _.extend {}, fixtures().users, {
        name: 'Kana Abe'
        partner_ids: ['5086df098523e60002000012']
        access_token: '$2a$10$PJrPMBadu1NPdmnshBgFbeZG5cyzJHBLK8D73niNWb7bPz5GyKH.u'
      }
      db.users.insert user, (err, result) ->
        User.fromAccessToken 'foobar', (err, user) ->
          user.name.should.equal 'Kana Abe'
          done()

    it 'creates a user if there is no user', (done) ->
      User.fromAccessToken 'foobar', (err, user) ->
        user.name.should.equal 'Craig Spaeth'
        done()

    it 'updates a user if partner_ids have changed', (done) ->
      user = _.extend {}, fixtures().users, partner_ids: []
      db.users.insert user, ->
        User.fromAccessToken 'foobar', (err, user) ->
          user.partner_ids[0].toString().should.equal '5086df098523e60002000012'
          done()

  describe '#present', ->

    it 'converts _id to id', ->
      data = User.present _.extend fixtures().users, _id: 'foo'
      (data._id?).should.not.be.ok
      data.id.should.equal 'foo'

  describe '#refresh', ->

    it 'refreshes the user basic info', (done) ->
      user = _.extend fixtures().users, {name: 'Nah'}
      db.users.insert user, ->
        User.refresh 'foobar', (err, user) ->
          user.name.should.equal 'Craig Spaeth'
          User.fromAccessToken 'foobar', (err, user) ->
            user.name.should.equal 'Craig Spaeth'
            done()

    it 'refreshes the user partner access', (done) ->
      user = _.extend fixtures().users, { has_access_token: true, partner_ids: ['123'] }
      db.users.insert user, (err, user) ->
        user.partner_ids.length.should.equal 1
        user.partner_ids[0].should.equal '123'
        User.refresh 'foobar', (err, user) ->
          user.partner_ids[0].toString().should.equal '5086df098523e60002000012'
          User.fromAccessToken 'foobar', (err, user) ->
            user.partner_ids[0].toString().should.equal '5086df098523e60002000012'
            done()

    it 'refreshes the user channel access', (done) ->
      user = _.extend fixtures().users, { has_access_token: true, channel_ids: ['123'] }
      db.users.insert user, (err, user) ->
        user.channel_ids.length.should.equal 1
        User.refresh 'foobar', (err, user) ->
          user.channel_ids.length.should.equal 0
          User.fromAccessToken 'foobar', (err, user) ->
            user.channel_ids.length.should.equal 0
            done()

  describe '#hasChannelAccess', ->

    it 'returns true for a channel member', (done) ->
      user = _.extend fixtures().users, { channel_ids: [ ObjectId '5086df098523e60002000018' ] }
      channel = _.extend fixtures().channels, { _id: ObjectId('5086df098523e60002000018') }
      db.channels.insert channel , (err, channel) ->
        User.hasChannelAccess(user, '5086df098523e60002000018').should.be.true()
        done()

    it 'returns true for a partner channel member', (done) ->
      user = _.extend fixtures().users, { partner_ids: [ '5086df098523e60002000012' ] }
      User.hasChannelAccess(user, '5086df098523e60002000012').should.be.true()
      done()

    it 'returns true for a non-partner or non-channel member but admin on a partner channel', (done) ->
      user = _.extend fixtures().users, { channel_ids: [], partner_ids: [] }
      User.hasChannelAccess(user, '5086df098523e60002000012').should.be.true()
      done()

    it 'returns true for a non-partner or non-channel member but admin when no channel_id', (done) ->
      user = _.extend fixtures().users, { channel_ids: [], partner_ids: [], type: 'Admin' }
      User.hasChannelAccess(user).should.be.true()
      done()

    it 'returns false for a non-partner or non-channel member', (done) ->
      user = _.extend fixtures().users, { channel_ids: [], partner_ids: [], type: 'User' }
      User.hasChannelAccess(user, '5086df098523e60002000012').should.be.false()
      done()


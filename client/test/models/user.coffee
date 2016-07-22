_ = require 'underscore'
Backbone = require 'backbone'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'
rewire = require 'rewire'
request = require 'superagent'
async = require 'async'
User = rewire '../../models/user'
Article = require '../../models/article'
{ fabricate } = require 'antigravity'

describe "User", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'

  afterEach ->
    Backbone.sync.restore()

  describe '#isAdmin', ->

    it 'returns true for an Admin user', ->
      @user = new User fixtures().users
      @user.isAdmin().should.be.true()

    it 'returns false for a non-Admin user', ->
      @user = new User _.extend fixtures().users, type: 'User'
      @user.isAdmin().should.be.false()

  describe '#hasChannel', ->

    it 'returns true for a member of a channel', ->
      @user = new User _.extend fixtures().users, { channel_ids: ['1234'] }
      @user.hasChannel('1234').should.be.true()

    it 'returns false for a non-member of a channel', ->
      @user = new User _.extend fixtures().users, { channel_ids: [] }
      @user.hasChannel('1234').should.be.false()

  describe '#hasPartner', ->

    it 'returns true for a user with partner permissions', ->
      @user = new User _.extend fixtures().users, { partner_ids: ['1234'] }
      @user.hasPartner('1234').should.be.true()

    it 'returns true for a user that is an Admin', ->
      @user = new User fixtures().users
      @user.hasPartner('1234').should.be.true()

    it 'returns false for a user that does not have partner permissions', ->
      @user = new User _.extend fixtures().users, { type: 'User', partner_ids: [] }
      @user.hasPartner('1234').should.be.false()

  describe '#hasArticleAccess', ->

    it 'returns true for a member of a channel on a channel article', ->
      @article = new Article fixtures().articles
      @user = new User _.extend fixtures().users, { channel_ids: ['1234'] }
      @user.hasArticleAccess(@article).should.be.true()

    it 'returns true for a member of a partner on a partner article', ->
      @article = new Article _.extend fixtures().articles, { partner_channel_id: '1234' }
      @user = new User _.extend fixtures().users, { partner_ids: ['1234'] }
      @user.hasArticleAccess(@article).should.be.true()

    it 'returns true for a member of an Admin on a partner article', ->
      @article = new Article fixtures().articles
      @user = new User _.extend fixtures().users, { channel_ids: ['1234'] }
      @user.hasArticleAccess(@article).should.be.true()

    it 'returns false for a member of a channel on a partner article', ->
      @article = new Article _.extend fixtures().articles, { partner_channel_id: '1234' }
      @user = new User _.extend fixtures().users, { channel_ids: ['12345'], type: 'User' }
      @user.hasArticleAccess(@article).should.be.false()

    it 'returns false for a member of a partner on a channel article', ->
      @article = new Article _.extend fixtures().articles, { channel_id: '1234' }
      @user = new User _.extend fixtures().users, { partner_ids: ['12345'] }
      @user.hasArticleAccess(@article).should.be.false()

  describe '#isOutdated', ->

    it 'returns true if the name has changed', ->
      User.__set__ 'async',
        waterfall: sinon.stub().yields(null, [
          _.extend fixtures().users,
              name: 'A Girl'
          [ { _id: '4d8cd73191a5c50ce2000022' } ]
          [ { id: '4d8cd73191a5c50ce200002b' } ]
        ])
      @user = new User _.extend fixtures().users, {
        name: 'Arya Stark'
        channel_ids: [ '4d8cd73191a5c50ce200002b' ]
        partner_ids: [ '4d8cd73191a5c50ce2000022' ]
      }
      @user.isOutdated (outdated) ->
        outdated.should.be.true()

    it 'returns true if the type has changed', ->
      User.__set__ 'async',
        waterfall: sinon.stub().yields(null, [
          _.extend fixtures().users,
            name: 'Jon Snow'
            type: 'King in the North'
          [ { _id: '4d8cd73191a5c50ce2000022' } ]
          [ { id: '4d8cd73191a5c50ce200002b' } ]
        ])
      @user = new User _.extend fixtures().users, {
        name: 'Jon Snow'
        type: 'Lord Commander of the Night\'s Watch'
        channel_ids: [ '4d8cd73191a5c50ce200002b' ]
        partner_ids: [ '4d8cd73191a5c50ce2000022' ]
      }
      @user.isOutdated (outdated) ->
        outdated.should.be.true()

    it 'returns true if the email has changed', ->
      User.__set__ 'async',
        waterfall: sinon.stub().yields(null, [
          _.extend fixtures().users,
            name: 'Cersi Lannister'
            email: 'madkween@got'
          [ { _id: '4d8cd73191a5c50ce2000022' } ]
          [ { id: '4d8cd73191a5c50ce200002b' } ]
        ])
      @user = new User _.extend fixtures().users, {
        name: 'Cersi Lannister'
        email: 'seekingrevenge@got'
        channel_ids: [ '4d8cd73191a5c50ce200002b' ]
        partner_ids: [ '4d8cd73191a5c50ce2000022' ]
      }
      @user.isOutdated (outdated) ->
        outdated.should.be.true()

    it 'returns true if channel permissions have changed', ->
      User.__set__ 'async',
        waterfall: sinon.stub().yields(null, [
          _.extend fixtures().users,
            name: 'Cersi Lannister'
          [ { _id: '4d8cd73191a5c50ce2000022' } ]
          []
        ])
      @user = new User _.extend fixtures().users, {
        name: 'Cersi Lannister'
        channel_ids: [ '4d8cd73191a5c50ce200002b' ]
        partner_ids: [ '4d8cd73191a5c50ce2000022' ]
      }
      @user.isOutdated (outdated) ->
        outdated.should.be.true()

    it 'returns true if partner permissions have changed', ->
      User.__set__ 'async',
        waterfall: sinon.stub().yields(null, [
          _.extend fixtures().users,
            name: 'Cersi Lannister'
          []
          [ { id: '4d8cd73191a5c50ce200002b' }]
        ])
      @user = new User _.extend fixtures().users, {
        name: 'Cersi Lannister'
        channel_ids: [ '4d8cd73191a5c50ce200002b' ]
        partner_ids: [ '4d8cd73191a5c50ce2000022' ]
      }
      @user.isOutdated (outdated) ->
        outdated.should.be.true()

    it 'returns false if nothing has changed', ->
      User.__set__ 'async',
        waterfall: sinon.stub().yields(null, [
          _.extend fixtures().users,
            name: 'Cersi Lannister'
            channel_ids: [ '4d8cd73191a5c50ce200002b' ]
            partner_ids: [ '4d8cd73191a5c50ce2000022' ]
          [ _id: '4d8cd73191a5c50ce2000022' ]
          [ id: '4d8cd73191a5c50ce200002b' ]
        ])
      @user = new User _.extend fixtures().users, {
        name: 'Cersi Lannister'
        channel_ids: [ '4d8cd73191a5c50ce200002b' ]
        partner_ids: [ '4d8cd73191a5c50ce2000022' ]
      }
      @user.isOutdated (outdated) ->
        outdated.should.be.false()

  describe '#fetchPartners', ->

    it 'returns empty array for no partner access', ->
      @user = new User fixtures().users
      @user.fetchPartners (partners) ->
        partners.length.should.equal 0

    it 'fetches the partners that a user has permission to', ->
      request.get = sinon.stub().returns
        set: sinon.stub().returns
          end: (cb) -> cb( null, body: [ fabricate 'partner' ] )

      User.__set__ 'request', request
      @user = new User _.extend fixtures().users,
        partner_ids: ['123']
      @user.fetchPartners (partners) ->
        partners.length.should.equal 1
        partners[0].name.should.equal 'Gagosian Gallery'
        partners[0].type.should.equal 'Gallery'

_ = require 'underscore'
rewire = require 'rewire'
{ fabricate, empty } = require '../../../../test/helpers/db'
Retrieve = rewire '../../model/retrieve'
express = require 'express'
gravity = require('antigravity').server
app = require('express')()
sinon = require 'sinon'
_ = require 'underscore'
Joi = require 'joi'
Joi.objectId = require('joi-objectid') Joi
schema = require '../../model/schema.coffee'
{ ObjectId } = require 'mongojs'

describe 'Retrieve', ->

  before (done) ->
    app.use '/__gravity', gravity
    @server = app.listen 5000, ->
      done()

  after ->
    @server.close()

  beforeEach (done) ->
    empty ->
      fabricate 'articles', _.times(10, -> {}), ->
        done()

  describe '#toQuery', ->

    it 'type casts ids', (done) ->
      Retrieve.toQuery {
        author_id: '5086df098523e60002000018'
        published: true
      }, (err, query) =>
        query.author_id.should.containEql ObjectId '5086df098523e60002000018'
        done()

    it 'aggregates the query for all_by_author', (done) ->
      Retrieve.toQuery {
        all_by_author: '5086df098523e60002000017'
        published: true
      }, (err, query) =>
        query['$or'][0].author_id.should.containEql ObjectId '5086df098523e60002000017'
        query['$or'][1].contributing_authors['$elemMatch'].should.be.ok()
        query['$or'][1].contributing_authors['$elemMatch'].id.should.containEql ObjectId '5086df098523e60002000017'
        done()

    it 'aggregates the query for vertical', (done) ->
      Retrieve.toQuery {
        vertical: '55356a9deca560a0137bb4a7'
        published: true
      }, (err, query) =>
        query.vertical['$elemMatch'].should.be.ok()
        query.vertical['$elemMatch'].id.should.containEql ObjectId '55356a9deca560a0137bb4a7'
        done()

    it 'aggregates the query for artist_id', (done) ->
      Retrieve.toQuery {
        artist_id: '5086df098523e60002000016'
        published: true
      }, (err, query) =>
        query['$or'][0].primary_featured_artist_ids.should.containEql ObjectId '5086df098523e60002000016'
        query['$or'][1].featured_artist_ids.should.containEql ObjectId '5086df098523e60002000016'
        query['$or'][2].biography_for_artist_id.should.containEql ObjectId '5086df098523e60002000016'
        done()

    it 'uses Regex in thumbnail_title for q', (done) ->
      Retrieve.toQuery {
        q: 'Thumbnail Title 101'
        published: true
      }, (err, query) =>
        query.hasOwnProperty('thumbnail_title').should.be.true()
        query.thumbnail_title['$regex'].should.be.ok()
        done()

    it 'ignores q if it is empty', (done) ->
      Retrieve.toQuery {
        q: ''
        published: true
      }, (err, query) =>
        query.hasOwnProperty('thumbnail_title').should.be.false()
        done()

    it 'strips out unknown keys in the query', (done) ->
      Retrieve.toQuery {
        published: true
        session_id: '12345'
      }, (err, query) =>
        query.published.should.be.true()
        query.session_id?.should.be.false()
        done()

    it 'aggregates the query for has_video', (done) ->
      Retrieve.toQuery {
        has_video: true
        published: true
      }, (err, query) =>
        query['$or'][1]['hero_section.type'].should.be.ok()
        query['$or'][1]['hero_section.type'].should.equal 'video'
        query['$or'][0].sections['$elemMatch'].should.be.ok()
        query['$or'][0].sections['$elemMatch'].type.should.equal 'video'
        done()

    it 'finds articles by multiple fair ids', (done) ->
      Retrieve.toQuery {
        fair_ids: ['5086df098523e60002000016','5086df098523e60002000015']
        published: true
      }, (err, query) =>
        query.fair_ids['$elemMatch'].should.be.ok()
        query.fair_ids['$elemMatch']['$in'][0].toString().should.equal '5086df098523e60002000016'
        query.fair_ids['$elemMatch']['$in'][1].toString().should.equal '5086df098523e60002000015'
        done()

    it 'finds articles by multiple ids', (done) ->
      Retrieve.toQuery {
        ids: ['54276766fd4f50996aeca2b8', '54276766fd4f50996aeca2b7']
        published: true
      }, (err, query) =>
        query._id['$in'].should.be.ok()
        query._id['$in'][0].toString().should.equal '54276766fd4f50996aeca2b8'
        query._id['$in'][1].toString().should.equal '54276766fd4f50996aeca2b7'
        done()

    it 'finds scheduled articles', (done) ->
      Retrieve.toQuery {
        scheduled: true
      }, (err, query) =>
        query.scheduled_publish_at.should.have.keys '$ne'
        done()
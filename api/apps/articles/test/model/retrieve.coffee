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
        query.thumbnail_title['$regex'].should.be.ok()
        done()

_ = require 'underscore'
sinon = require 'sinon'
{ db, fabricate, empty, fixtures } = require '../../../../../test/helpers/db'
gravity = require('antigravity').server
express = require 'express'
app = require('express')()
Article = require '../../../model/index.js'
search = require '../../../../../lib/elasticsearch'
{ ObjectId } = require 'mongojs'
moment = require 'moment'

describe 'Article', ->

  before (done) ->
    app.use '/__gravity', gravity
    @server = app.listen 5000, ->
      search.client.indices.create
        index: 'articles_' + process.env.NODE_ENV
      , ->
        done()

  after ->
    @server.close()
    search.client.indices.delete
      index: 'articles_' + process.env.NODE_ENV

  beforeEach (done) ->
    empty ->
      fabricate 'articles', _.times(10, -> {}), ->
        done()

  describe '#publishScheduledArticles', ->

    it 'calls #save on each article that needs to be published', (done) ->
      fabricate 'articles',
        _id: ObjectId('54276766fd4f50996aeca2b8')
        author_id: ObjectId('5086df098523e60002000018')
        published: false
        scheduled_publish_at: moment('2016-01-01').toDate()
        author:
          name: 'Kana Abe'
        sections: [
          {
            type: 'text'
            body: 'The start of a new article'
          }
          {
            type: 'image_collection'
            layout: 'overflow_fillwidth'
            images: [
              url: 'https://image.png'
              caption: 'Trademarked'
            ]
          }
        ]
      , ->
        Article.publishScheduledArticles (err, results) ->
          results[0].published.should.be.true()
          results[0].published_at.toString().should.equal moment('2016-01-01').toDate().toString()
          results[0].sections[0].body.should.containEql 'The start of a new article'
          results[0].sections[1].images[0].url.should.containEql 'https://image.png'
          done()

  describe '#unqueue', ->

    it 'calls #save on each article that needs to be unqueued', (done) ->
      fabricate 'articles',
        _id: ObjectId('54276766fd4f50996aeca2b8')
        weekly_email: true
        daily_email: true
        author:
          name: 'Kana Abe'
        sections: []
      , ->
        Article.unqueue (err, results) ->
          results[0].weekly_email.should.be.false()
          results[0].daily_email.should.be.false()
          done()

  describe "#destroy", ->

    it 'removes an article', (done) ->
      fabricate 'articles', { _id: ObjectId('5086df098523e60002000018') }, ->
        Article.destroy '5086df098523e60002000018', (err) ->
          db.articles.count (err, count) ->
            count.should.equal 10
            done()

    it 'returns an error message', (done) ->
      Article.destroy '5086df098523e60002000019', (err) ->
        err.message.should.equal 'Article not found.'
        done()

    it 'removes the article from elasticsearch', (done) ->
      fabricate 'articles', { _id: ObjectId('5086df098523e60002000019'), title: 'quux' }, ->
        setTimeout( =>
          Article.destroy '5086df098523e60002000019', (err) ->
            setTimeout( =>
              search.client.search(
                index: search.index
                q: 'title:quux'
              , (error, response) ->
                response.hits.hits.length.should.equal 0
                done()
              )
            , 1000)
        , 1000)

  describe '#present', ->

    it 'adds both _id and id', ->
      Article.present _.extend({}, fixtures().articles, _id: 'foo')
      .then (result) =>
        result.id.should.equal 'foo'
        result._id.should.equal 'foo'

    it 'converts dates to ISO strings', ->
      Article.present _.extend({}, fixtures().articles, published_at: new Date, scheduled_publish_at: new Date)
      .then (result) =>
        moment(result.updated_at).toISOString().should.equal result.updated_at
        moment(result.published_at).toISOString().should.equal result.published_at
        moment(result.scheduled_publish_at).toISOString().should.equal result.scheduled_publish_at

  describe '#presentCollection', ->

    it 'shows a total/count/results hash for arrays of articles', ->
      Article.presentCollection
        total: 10
        count: 1
        results: [_.extend {}, fixtures().articles, _id: 'baz']
      .then (result) =>
        result.results[0].id.should.equal 'baz'

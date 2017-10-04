_ = require 'underscore'
sinon = require 'sinon'
{ db, fabricate, empty, fixtures } = require '../../../../../test/helpers/db'
gravity = require('antigravity').server
express = require 'express'
app = require('express')()
rewire = require 'rewire'
Article = rewire '../../../model/index'
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
        err.should.equal 'Article not found.'
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
      data = Article.present _.extend {}, fixtures().articles, _id: 'foo'
      (data._id?).should.be.ok
      data.id.should.equal 'foo'

    it 'converts dates to ISO strings', ->
      data = Article.present _.extend {}, fixtures().articles, published_at: new Date, scheduled_publish_at: new Date
      moment(data.updated_at).toISOString().should.equal data.updated_at
      moment(data.published_at).toISOString().should.equal data.published_at
      moment(data.scheduled_publish_at).toISOString().should.equal data.scheduled_publish_at

  describe '#presentCollection', ->

    it 'shows a total/count/results hash for arrays of articles', ->
      data = Article.presentCollection
        total: 10
        count: 1
        results: [_.extend {}, fixtures().articles, _id: 'baz']
      data.results[0].id.should.equal 'baz'
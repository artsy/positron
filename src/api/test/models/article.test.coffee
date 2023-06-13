_ = require 'underscore'
Q = require 'bluebird-q'
Backbone = require 'backbone'
rewire = require 'rewire'
Article = rewire '../../models/article.coffee'
sinon = require 'sinon'
moment = require 'moment'
gravity = require('@artsy/antigravity').server
app = require('express')()

describe "Article", ->

  beforeEach ->
    Article.__set__ 'FORCE_URL', 'https://artsy.net'
    Article.__set__ 'Authors', mongoFetch: @AuthorFetch = sinon.stub()
    Article.__set__ 'EDITORIAL_CHANNEL', '12345'
    @article = new Article

  describe '#isFeature', ->

    it 'returns true for featured articles', ->
      @article.set 'featured', true
      @article.isFeatured().should.be.true()

    it 'returns false for non-featured articles', ->
      @article.set 'featured', false
      @article.isFeatured().should.be.false()

  describe '#isEditorial', ->

    it 'returns true for featured articles', ->
      @article.set 'channel_id', '12345'
      @article.isEditorial().should.be.true()

    it 'returns false for non-featured articles', ->
      @article.set 'partner_channel_id', '13579'
      @article.isEditorial().should.be.false()

  describe '#getAuthors', ->

    describe 'Editorial', ->
      it 'returns a list of authors', (cb) ->
        @article.set
          author_ids: ['123', '456']
          channel_id: '12345'
        authors = [
          { name: 'Molly' }
          { name: 'Kana' }
        ]
        @AuthorFetch.yields null, results: authors
        @article.getAuthors (authors) ->
          authors[0].should.equal 'Molly'
          authors[1].should.equal 'Kana'
          cb()

      it 'has a fallback author', (cb) ->
        @article.set 'channel_id', '12345'
        @AuthorFetch.yields null, results: []
        @article.getAuthors (authors) ->
          authors[0].should.equal 'Artsy Editors'
          authors.length.should.equal 1
          cb()

    describe 'Non-Editorial', ->
      it 'returns contributing authors', (cb) ->
        @article.set 'contributing_authors', [
          { name: 'Molly' }
          { name: 'Kana' }
        ]
        @article.getAuthors (authors) ->
          authors[0].should.equal 'Molly'
          authors[1].should.equal 'Kana'
          cb()

      it 'returns an author', (cb) ->
        @article.set 'author', name: 'Kana'
        @article.getAuthors (authors) ->
          authors[0].should.equal 'Kana'
          cb()

  describe '#searchBoost', ->
    it 'creates a freshness score for search with a maximum cap', ->
      @article.set 'published', true
      @article.set 'published_at', new Date()
      @article.searchBoost().should.be.below(1001)
      @article.searchBoost().should.be.above(998)

    it 'creates a lower score for an older article', ->
      @article.set 'published', true
      @article.set 'published_at', new Date(2022, 4, 10)
      @article.searchBoost().should.be.below(1000)
      @article.searchBoost().should.be.above(100)

  describe '#date', ->

    it 'return a moment object with the attribute', ->
      @article.set 'published_at', '2017-05-05'
      @article.date('published_at').format('YYYYMMDD').should.equal '20170505'

  describe '#fullHref', ->

    it 'returns the full href', ->
      @article.set 'slugs', ['artsy-editorial-test']
      @article.fullHref().should.equal 'https://artsy.net/article/artsy-editorial-test'

  describe '#href', ->

    it 'returns the relative url', ->
      @article.set 'slugs', ['artsy-editorial-relative']
      @article.href().should.equal '/article/artsy-editorial-relative'

  describe '#slug', ->

    it 'gets the slug', ->
      @article.set 'slugs', [
        'artsy-editorial-test1'
        'artsy-editorial-test2'
        'artsy-editorial-test3'
      ]
      @article.slug().should.equal 'artsy-editorial-test3'

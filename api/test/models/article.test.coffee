_ = require 'underscore'
Q = require 'bluebird-q'
Backbone = require 'backbone'
rewire = require 'rewire'
Article = rewire '../../models/article'
sinon = require 'sinon'
moment = require 'moment'
gravity = require('antigravity').server
app = require('express')()

describe "Article", ->

  beforeEach ->
    Article.__set__ 'FORCE_URL', 'https://artsy.net'
    @article = new Article

  describe '#prepForInstant', ->

    it 'returns the article with empty tags removed', ->
      @article.set 'sections', [
        { type: 'text', body: '<p>First Paragraph</p><p></p>' },
        { type: 'text', body: '<p>Second Paragraph</p><br>'}
      ]
      @article.prepForInstant()
      @article.get('sections')[0].body.should.equal '<p>First Paragraph</p>'
      @article.get('sections')[1].body.should.equal '<p>Second Paragraph</p>'

    it 'returns the article with captions p tags replaced by h1', ->
      @article.set 'sections', [
        { type: 'image_set', images: [
          { type: 'image', caption: '<p>A place for credit</p>' }
        ]}
      ]
      @article.prepForInstant()
      @article.get('sections')[0].images[0].caption.should.equal '<h1>A place for credit</h1>'

  describe '#isEditorial', ->

    it 'returns true for featured articles', ->
      @article.set 'featured', true
      @article.isEditorial().should.be.true()

    it 'returns false for non-featured articles', ->
      @article.set 'featured', false
      @article.isEditorial().should.be.false()

  describe '#getAuthorArray', ->

    it 'returns a list of authors', ->
      @article.set 'author', name: 'Artsy Editorial'
      @article.set 'contributing_authors', [
        { name: 'Molly' }
        { name: 'Kana' }
      ]
      @article.getAuthorArray()[0].should.equal 'Artsy Editorial'
      @article.getAuthorArray()[1].should.equal 'Molly'
      @article.getAuthorArray()[2].should.equal 'Kana'

  describe '#searchBoost', ->
    it 'creates a freshness score for search with a maximum cap', ->
      @article.set 'published', true
      @article.set 'published_at', new Date()
      @article.searchBoost().should.be.below(1001)
      @article.searchBoost().should.be.above(998)

    it 'creates a lower score for an older article', ->
      @article.set 'published', true
      @article.set 'published_at', new Date(2016, 4, 10)
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

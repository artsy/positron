_ = require 'underscore'
Q = require 'bluebird-q'
Backbone = require 'backbone'
rewire = require 'rewire'
Article = rewire '../../models/article'
sinon = require 'sinon'

describe "Article", ->
  beforeEach ->
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
        { type: 'image', caption: '<p>First Paragraph</p>' },
        { type: 'image_set', images: [
          { type: 'image', caption: '<p>A place for credit</p>' }
        ]}
      ]
      @article.prepForInstant()
      @article.get('sections')[0].caption.should.equal '<h1>First Paragraph</h1>'
      @article.get('sections')[1].images[0].caption.should.equal '<h1>A place for credit</h1>'

  describe '#isEditorial', ->

  describe '#getAuthorArray', ->

  describe '#date', ->

  describe '#fullHref', ->

  describe '#href', ->

  describe '#slug', ->

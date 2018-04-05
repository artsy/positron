_ = require 'underscore'
rewire = require 'rewire'
{ fabricate, empty } = require '../../../../test/helpers/db'
Save = rewire '../../model/save'
Article = require '../../model/index'
express = require 'express'
gravity = require('antigravity').server
app = require('express')()
sinon = require 'sinon'
moment = require 'moment'
{ ObjectId } = require 'mongojs'

describe 'Save', ->

  before (done) ->
    app.use '/__gravity', gravity
    @server = app.listen 5000, ->
      done()

  after ->
    @server.close()

  beforeEach (done) ->
    @removeStopWords = Save.__get__ 'removeStopWords'
    Save.__set__ 'artsyXapp', { token: 'foo' }
    Save.__set__ 'request', post: (@post = sinon.stub()).returns
      send: (@send = sinon.stub()).returns
        end: sinon.stub().yields()
    Save.__set__ 'distributeArticle', @distributeArticle = sinon.stub().yields()
    Save.__set__ 'deleteArticleFromSailthru', @deleteArticleFromSailthru = sinon.stub().yields()
    Save.__set__ 'indexForSearch', @indexForSearch = sinon.stub()

    empty ->
      fabricate 'articles', _.times(10, -> {}), ->
        done()

  describe '#removeStopWords', ->

    it 'removes stop words from a string', (done) ->
      @removeStopWords('Why. the Internet Is Obsessed with These Videos of People Making Things').should.containEql 'internet obsessed videos people making things'
      @removeStopWords('Heirs of Major Jewish Art Dealer Sue Bavaria over $20 Million of Nazi-Looted Art').should.containEql 'heirs major jewish art dealer sue bavaria 20 million nazi-looted art'
      @removeStopWords('Helen Marten Wins UK’s Biggest Art Prize—and the 9 Other Biggest News Stories This Week').should.containEql 'helen marten wins uks art prize 9 news stories week'
      done()

    it 'if all words are stop words, keep the title', (done) ->
      @removeStopWords("I’ll be there").should.containEql 'Ill be there'
      done()

  describe '#onPublish', (done) ->

    it 'generates slugs and published_at if not present', (done) ->
      Save.onPublish { thumbnail_title: 'a title' }, (err, article) =>
        article.slugs.length.should.equal 1
        moment(article.published_at).format('MM DD YYYY').should
          .equal moment().format('MM DD YYYY')
        done()

    it 'does not generate published_at if scheduled', (done) ->
      Save.onPublish { thumbnail_title: 'a title', scheduled_publish_at: '2017-07-26T17:37:03.065Z', published_at: null }, (err, article) =>
        (article.published_at is null).should.be.true()
        done()

  describe '#generateSlugs', ->

    it 'generates a slug', (done) ->
      Save.generateSlugs {
        thumbnail_title: 'Clockwork'
        published: true
        author: name: 'Molly'
      }, (err, article) =>
        article.slugs[0].should.equal 'molly-clockwork'
        done()

    it 'appends a date to the slug if it exists already', (done) ->
      Save.sanitizeAndSave( =>
        Save.generateSlugs {
          thumbnail_title: 'Clockwork'
          published: true
          author: name: 'Molly'
          published_at: '2017-07-26T17:37:03.065Z'
        }, (err, article) =>
          article.slugs[0].should.equal 'molly-clockwork-07-26-17'
          done()
      )(null, {
        slugs: ['molly-clockwork']
      })

    it 'appends unix to the slug if it exists already and it is a draft', (done) ->
      Save.sanitizeAndSave( =>
        Save.generateSlugs {
          thumbnail_title: 'Clockwork'
          published: false
          author: name: 'Molly'
          published_at: '2017-07-26T17:37:03.065Z'
        }, (err, article) =>
          article.slugs[0].should.equal 'molly-clockwork-1501090623'
          done()
      )(null, {
        slugs: ['molly-clockwork']
      })

    it 'does not append author if it is series layout', (done) ->
      Save.generateSlugs {
        thumbnail_title: 'Clockwork'
        published: true
        author: name: 'Molly'
        layout: 'series'
      }, (err, article) =>
        article.slugs[0].should.equal 'clockwork'
        done()

  describe '#onUnpublish', ->

    it 'generates slugs and deletes article from sailthru', (done) ->
      Save.onUnpublish {
        thumbnail_title: 'delete me a title'
        author_id: '5086df098523e60002000018'
        author: {
          name: 'artsy editorial'
        }
        layout: 'video'
      }, (err, article) =>
        article.slugs.length.should.equal 1
        @deleteArticleFromSailthru.args[0][0].should.containEql 'video/artsy-editorial-delete-title'
        done()

    it 'Regenerates the slug with stop words removed', (done) ->
      Save.onUnpublish {
        thumbnail_title: 'One New York Building Changed the Way Art Is Made, Seen, and Sold'
        author_id: '5086df098523e60002000018'
        author: {
          name: 'artsy editorial'
        }
        layout: 'feature'
      }, (err, article) =>
        article.slugs.length.should.equal 1
        @deleteArticleFromSailthru.args[0][0].should.containEql 'article/artsy-editorial-one-new-york-building-changed-way-art-made-seen-sold'
        done()


  describe '#sanitizeAndSave', ->

    it 'skips sanitizing links that do not have an href', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.sections[0].body.should.containEql '<a></a>'
          done()
      )(null, {
        _id: ObjectId '5086df098523e60002000011'
        sections: [
          {
            type: 'text'
            body: '<a>'
          }
        ]
      })

    it 'can save follow artist links (whitelist data-id)', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.sections[0].body.should.containEql '<a data-id="andy-warhol"></a>'
          done()
      )(null, {
        _id: ObjectId '5086df098523e60002000011'
        sections: [
          {
            type: 'text'
            body: '<a data-id="andy-warhol"></a>'
          }
        ]
      })

    it 'can save layouts on text sections', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.sections[0].layout.should.eql 'blockquote'
          done()
      )(null, {
        _id: ObjectId '5086df098523e60002000011'
        sections: [
          {
            type: 'text'
            body: '<blockquote>Viva Art</blockquote>'
            layout: 'blockquote'
          }
        ]
      })

    it 'indexes articles that are indexable', (done) ->
      Save.sanitizeAndSave( =>
        Article.find '5086df098523e60002000011', (err, article) =>
          @indexForSearch.callCount.should.eql 1
          done()
      )(null, {
        indexable: true
        _id: ObjectId '5086df098523e60002000011'
      })

    it 'skips indexing articles that are not indexable', (done) ->
      Save.sanitizeAndSave( =>
        Article.find '5086df098523e60002000011', (err, article) =>
          @indexForSearch.callCount.should.eql 0
          done()
      )(null, {
        indexable: false
        _id: ObjectId '5086df098523e60002000011'
      })

    it 'saves email metadata', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.email_metadata.image_url.should.containEql 'foo.png'
          article.email_metadata.author.should.containEql 'Kana'
          article.email_metadata.headline.should.containEql 'Thumbnail Title'
          done()
      )(null, {
        _id: ObjectId '5086df098523e60002000011'
        thumbnail_title: 'Thumbnail Title'
        thumbnail_image: 'foo.png'
        scheduled_publish_at: '123'
        author: name: 'Kana'
      })

    it 'does not override email metadata', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.email_metadata.image_url.should.containEql 'bar.png'
          article.email_metadata.author.should.containEql 'Artsy Editorial'
          article.email_metadata.headline.should.containEql 'Custom Headline'
          done()
      )(null, {
        _id: ObjectId '5086df098523e60002000011'
        thumbnail_title: 'Thumbnail Title'
        thumbnail_image: 'foo.png'
        email_metadata:
          image_url: 'bar.png'
          author: 'Artsy Editorial'
          headline: 'Custom Headline'
        scheduled_publish_at: '123'
      })

    it 'saves generated descriptions', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.description.should.containEql 'Testing 123'
          done()
      )(null, {
        _id: ObjectId '5086df098523e60002000011'
        published: true
        sections: [
          { type: 'text', body: '<p>Testing 123</p>' }
        ]
      })

    it 'does not override description', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.description.should.containEql 'Do not override me'
          done()
      )(null, {
        _id: ObjectId '5086df098523e60002000011'
        sections: [
          { type: 'text', body: '<p>Testing 123</p>' }
        ]
        description: 'Do not override me'
      })

    it 'Strips linebreaks from titles', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.title.should.containEql 'A new title'
          done()
      )(null, {
        _id: ObjectId '5086df098523e60002000011'
        thumbnail_title: 'Thumbnail Title'
        sections: [
          { type: 'text', body: '<p>Testing 123</p>' }
        ]
        title: 'A new title \n'
      })

    it 'saves media', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) ->
          article.media.url.should.equal 'https://media.artsy.net/video.mp4'
          article.media.cover_image_url.should.equal 'https://media.artsy.net/images.jpg'
          article.media.duration.should.equal 1000
          article.media.release_date.should.equal '2017-01-01'
          article.media.published.should.equal false
          article.media.description.should.equal '<p>This video is about kittens.</p>'
          article.media.credits.should.equal '<p><b>Director</b><br>Marina Cashdan</p>'
          done()
      )(null, {
        _id: ObjectId '5086df098523e60002000011'
        media:
          url: 'https://media.artsy.net/video.mp4'
          cover_image_url: 'https://media.artsy.net/images.jpg'
          duration: 1000
          release_date: '2017-01-01'
          published: false
          description: '<p>This video is about kittens.</p>'
          credits: '<p><b>Director</b><br>Marina Cashdan</p>'
      })

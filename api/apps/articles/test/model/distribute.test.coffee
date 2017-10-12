_ = require 'underscore'
rewire = require 'rewire'
{ fabricate, empty } = require '../../../../test/helpers/db'
Distribute = rewire '../../model/distribute'
express = require 'express'
gravity = require('antigravity').server
app = require('express')()
sinon = require 'sinon'

describe 'Save', ->

  before (done) ->
    app.use '/__gravity', gravity
    @server = app.listen 5000, ->
      done()

  after ->
    @server.close()

  beforeEach (done) ->
    @sailthru = Distribute.__get__ 'sailthru'
    @sailthru.apiPost = sinon.stub().yields()
    @sailthru.apiDelete = sinon.stub().yields()
    Distribute.__set__ 'sailthru', @sailthru
    Distribute.__set__ 'request', post: (@post = sinon.stub()).returns
      send: (@send = sinon.stub()).returns
        end: sinon.stub().yields()
    empty ->
      fabricate 'articles', _.times(10, -> {}), ->
        done()

  describe '#distributeArticle', ->

    describe 'sends article to sailthru', ->

      it 'concats the article tag for a normal article', (done) ->
        Distribute.distributeArticle {
          author_id: '5086df098523e60002000018'
          published: true
        }, (err, article) =>
          @sailthru.apiPost.calledOnce.should.be.true()
          @sailthru.apiPost.args[0][1].tags.should.containEql 'article'
          @sailthru.apiPost.args[0][1].tags.should.not.containEql 'artsy-editorial'
          done()

      it 'does not send if it is scheduled', (done) ->
        Distribute.distributeArticle {
          author_id: '5086df098523e60002000018'
          published: false
          scheduled_publish_at: '10-10-11'
        }, (err, article) =>
          @sailthru.apiPost.calledOnce.should.be.false()
          done()

      it 'concats the tracking_tags and vertical', (done) ->
        Distribute.distributeArticle {
          author_id: '5086df098523e60002000018'
          published: true
          keywords: ['China']
          tracking_tags: ['explainers', 'profiles']
          vertical: {name: 'culture', id: '591b0babc88a280f5e9efa7a'}
        }, (err, article) =>
          @sailthru.apiPost.calledOnce.should.be.true()
          @sailthru.apiPost.args[0][1].tags.should.containEql 'China'
          @sailthru.apiPost.args[0][1].tags.should.containEql 'explainers'
          @sailthru.apiPost.args[0][1].tags.should.containEql 'profiles'
          @sailthru.apiPost.args[0][1].tags.should.containEql 'culture'
          done()

      it 'sends vertical as a custom variable', (done) ->
        Distribute.distributeArticle {
          author_id: '5086df098523e60002000018'
          published: true
          vertical: { name: 'culture', id: '591b0babc88a280f5e9efa7a' }
        }, (err, article) =>
          @sailthru.apiPost.calledOnce.should.be.true()
          @sailthru.apiPost.args[0][1].vars.vertical.should.equal 'culture'
          done()

      it 'concats the artsy-editorial and magazine tags for specialized articles', (done) ->
        Distribute.distributeArticle {
          author_id: '5086df098523e60002000018'
          published: true
          featured: true
        }, (err, article) =>
          @sailthru.apiPost.calledOnce.should.be.true()
          @sailthru.apiPost.args[0][1].tags.should.containEql 'article'
          @sailthru.apiPost.args[0][1].tags.should.containEql 'magazine'
          done()

      it 'concats the keywords at the end', (done) ->
        Distribute.distributeArticle {
          author_id: '5086df098523e60002000018'
          published: true
          featured: true
          keywords: ['sofa', 'midcentury', 'knoll']
        }, (err, article) =>
          @sailthru.apiPost.calledOnce.should.be.true()
          @sailthru.apiPost.args[0][1].tags[0].should.equal 'article'
          @sailthru.apiPost.args[0][1].tags[1].should.equal 'magazine'
          @sailthru.apiPost.args[0][1].tags[2].should.equal 'sofa'
          @sailthru.apiPost.args[0][1].tags[3].should.equal 'midcentury'
          @sailthru.apiPost.args[0][1].tags[4].should.equal 'knoll'
          done()

      it 'uses email_metadata vars if provided', (done) ->
        Distribute.distributeArticle {
          author_id: '5086df098523e60002000018'
          published: true
          email_metadata:
            credit_url: 'artsy.net'
            credit_line: 'Artsy Credit'
            headline: 'Article Email Title'
            author: 'Kana Abe'
            image_url: 'imageurl.com/image.jpg'
        }, (err, article) =>
          @sailthru.apiPost.args[0][1].title.should.containEql 'Article Email Title'
          @sailthru.apiPost.args[0][1].vars.credit_line.should.containEql 'Artsy Credit'
          @sailthru.apiPost.args[0][1].vars.credit_url.should.containEql 'artsy.net'
          @sailthru.apiPost.args[0][1].author.should.containEql 'Kana Abe'
          @sailthru.apiPost.args[0][1].images.full.url.should.containEql '&width=1200&height=706&quality=95&src=imageurl.com%2Fimage.jpg'
          @sailthru.apiPost.args[0][1].images.thumb.url.should.containEql '&width=900&height=530&quality=95&src=imageurl.com%2Fimage.jpg'
          done()

      it 'sends the article text body', (done) ->
        Distribute.distributeArticle {
          author_id: '5086df098523e60002000018'
          published: true
          send_body: true
          sections: [
            {
              type: 'text'
              body: '<html>BODY OF TEXT</html>'
            }
            {
              type: 'image_collection'
              images: [
                caption: 'This Caption'
                url: 'URL'
              ]
            }
          ]
        }, (err, article) =>
          @sailthru.apiPost.args[0][1].vars.html.should.containEql '<html>BODY OF TEXT</html>'
          @sailthru.apiPost.args[0][1].vars.html.should.not.containEql 'This Caption'
          done()

      it 'deletes all previously formed slugs in Sailthru', (done) ->
       Distribute.distributeArticle {
          author_id: '5086df098523e60002000018'
          published: true
          slugs: [
            'artsy-editorial-slug-one'
            'artsy-editorial-slug-two'
            'artsy-editorial-slug-three'
          ]
        }, (err, article) =>
          @sailthru.apiDelete.callCount.should.equal 2
          @sailthru.apiDelete.args[0][1].url.should.containEql 'slug-one'
          @sailthru.apiDelete.args[1][1].url.should.containEql 'slug-two'
          done()

    describe 'send article to Facebook Instant Articles', ->

      it 'sends the article', (done) ->
        Distribute.distributeArticle {
          author_id: '5086df098523e60002000018'
          published: true
          featured: true
          slugs: ['artsy-editorial-test']
          sections: [
            {
              type: 'text'
              body: '<p>This is a paragraph</p>'
            }
          ]
        }, (err, article) =>
          @post.args[0][0].should.equal 'https://graph.facebook.com/v2.7/12345/instant_articles'
          @send.args[0][0].html_source.should.containEql '<p>This is a paragraph</p>'
          @send.args[0][0].html_source.should.containEql 'fb:article_style'
          @send.args[0][0].html_source.should.containEql '<iframe src="http://link.artsy.net/join/sign-up-editorial-facebook" height="250" class="no-margin">'
          done()

      it 'performs a deep copy so it doesnt affect the original article when prepping', (done) ->
        originalArticle = {
          author_id: '5086df098523e60002000018'
          published: true
          featured: true
          slugs: ['artsy-editorial-test']
          sections: [
            {
              type: 'text'
              body: '<h3>This is a paragraph</h3>'
            }
          ]
        }
        Distribute.distributeArticle originalArticle, (err, article) =>
          @send.args[0][0].html_source.should.containEql '<h2>This is a paragraph</h2>'
          originalArticle.sections[0].body.should.containEql '<h3>This is a paragraph</h3>'
          done()

  describe '#deleteArticleFromSailthru', ->

    it 'deletes the article from sailthru', (done) ->
      Distribute.deleteArticleFromSailthru 'artsy-editorial-delete-me', (err, article) =>
        @sailthru.apiDelete.args[0][1].url.should.containEql 'artsy-editorial-delete-me'
        done()

_ = require 'underscore'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
rewire = require 'rewire'
Article = rewire '../model'
{ ObjectId } = require 'mongojs'
express = require 'express'
fabricateGravity = require('antigravity').fabricate
bodyParser = require 'body-parser'

describe 'Article', ->

  beforeEach (done) ->
    empty ->
      fabricate 'articles', _.times(10, -> {}), ->
        done()

  describe '#where', ->

    it 'can return all articles along with total and counts', (done) ->
      Article.where {}, (err, res) ->
        { total, count, results } = res
        total.should.equal 10
        count.should.equal 10
        results[0].title.should.equal 'Top Ten Booths'
        done()

    it 'can return articles by an author', (done) ->
      fabricate 'articles', {
        author_id: aid = ObjectId '4d8cd73191a5c50ce220002a'
        title: 'Hello Wurld'
      }, ->
        Article.where { author_id: aid.toString() }, (err, res) ->
          { total, count, results } = res
          total.should.equal 11
          count.should.equal 1
          results[0].title.should.equal 'Hello Wurld'
          done()

    it 'can return articles by published', (done) ->
      fabricate 'articles', _.times(3, -> { published: false, title: 'Moo baz' }), ->
        Article.where { published: false }, (err, { total, count, results }) ->
          total.should.equal 13
          count.should.equal 3
          results[0].title.should.equal 'Moo baz'
          done()

    it 'errors for bad queries', (done) ->
      Article.where { foo: 'bar' }, (err) ->
        err.message.should.containEql 'foo is not allowed'
        done()

    it 'can change skip and limit', (done) ->
      fabricate 'articles', [
        { title: 'Hello Wurld' }
        { title: 'Foo Baz' }
      ], ->
        Article.where { offset: 1, limit: 3 }, (err, { results }) ->
          results[0].title.should.equal 'Hello Wurld'
          done()

    it 'sorts by -updated_at by default', (done) ->
      fabricate 'articles', [
        { title: 'Hello Wurld', updated_at: moment().add(1, 'days').format() }
      ], ->
        Article.where {}, (err, { results }) ->
          results[0].title.should.equal 'Hello Wurld'
          done()

    it 'can find articles featured to an artist', (done) ->
      fabricate 'articles', [
        {
          title: 'Foo'
          featured_artist_ids: [ObjectId('4dc98d149a96300001003033')]
        }
        {
          title: 'Bar'
          primary_featured_artist_ids: [ObjectId('4dc98d149a96300001003033')]
        }
        {
          title: 'Baz'
          featured_artist_ids: [ObjectId('4dc98d149a96300001003033'), 'abc']
          primary_featured_artist_ids: [ObjectId('4dc98d149a96300001003033')]
        }
      ], ->
        Article.where(
          { artist_id: '4dc98d149a96300001003033' }
          (err, { results }) ->
            _.pluck(results, 'title').sort().join('').should.equal 'BarBazFoo'
            done()
        )

    it 'can find articles featured to an artwork', (done) ->
      fabricate 'articles', [
        {
          title: 'Foo'
          featured_artwork_ids: [ObjectId('4dc98d149a96300001003033')]
        }
        {
          title: 'Baz'
          featured_artwork_ids: [ObjectId('4dc98d149a96300001003033'), 'abc']
        }
      ], ->
        Article.where(
          { artwork_id: '4dc98d149a96300001003033' }
          (err, { results }) ->
            _.pluck(results, 'title').sort().join('').should.equal 'BazFoo'
            done()
        )

    it 'can find articles sorted by an attr', (done) ->
      db.articles.drop ->
        fabricate 'articles', [
          { title: 'C' }, { title: 'A' }, { title: 'B' }
        ], ->
          Article.where(
            { sort: '-title' }
            (err, { results }) ->
              _.pluck(results, 'title').sort().join('').should.containEql 'ABC'
              done()
          )

  describe '#find', ->

    it 'finds an article by an id string', (done) ->
      fabricate 'articles', { _id: ObjectId('5086df098523e60002000018') }, ->
        Article.find '5086df098523e60002000018', (err, article) ->
          article._id.toString().should.equal '5086df098523e60002000018'
          done()

    it 'can lookup an article by slug', (done) ->
      fabricate 'articles', {
        _id: ObjectId('5086df098523e60002000018')
        slugs: ['foo-bar']
      }, ->
        Article.find 'foo-bar', (err, article) ->
          article._id.toString().should.equal '5086df098523e60002000018'
          done()

  describe '#save', ->

    it 'saves valid article input data', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
      }, (err, article) ->
        article.title.should.equal 'Top Ten Shows'
        db.articles.count (err, count) ->
          count.should.equal 11
          done()

    it 'requires an author', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
      }, (err, article) ->
        err.message.should.containEql 'author_id is required'
        done()

    it 'adds an updated_at as a date', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
      }, (err, article) ->
        article.updated_at.should.be.an.instanceOf(Date)
        moment(article.updated_at).format('YYYY').should.equal moment().format('YYYY')
        done()

    it 'includes the id for a new article', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
      }, (err, article) ->
        return done err if err
        (article._id?).should.be.ok
        done()

    it 'adds a slug based off the title', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
      }, (err, article) ->
        return done err if err
        article.slugs[0].should.equal 'top-ten-shows'
        done()

    it 'adds a slug based off a user and title', (done) ->
      fabricate 'users', { user: { name: 'Molly' } }, (err, @user) ->
        Article.save {
          title: 'Foo Baz'
          author_id: @user._id
        }, (err, article) ->
          return done err if err
          article.slugs[0].should.equal 'molly-foo-baz'
          done()

    it 'saves slug history to support old slugs', (done) ->
      fabricate 'users', { user: { name: 'Molly' } }, (err, @user) ->
        Article.save {
          title: 'Foo Baz'
          author_id: @user._id
        }, (err, article) =>
          return done err if err
          Article.save {
            id: article._id.toString()
            title: 'Foo Bar Baz'
            author_id: @user._id
          }, (err, article) ->
            return done err if err
            article.slugs.join('').should.equal 'molly-foo-bazmolly-foo-bar-baz'
            Article.find article.slugs[0], (err, article) ->
              article.title.should.equal 'Foo Bar Baz'
              done()

    it 'saves published_at when the articles is published', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
        published: true
      }, (err, article) ->
        article.published_at.should.be.an.instanceOf(Date)
        moment(article.published_at).format('YYYY').should
          .equal moment().format('YYYY')
        done()

  describe "#destroy", ->

    it 'removes an article', (done) ->
      fabricate 'articles', { _id: ObjectId('5086df098523e60002000018') }, ->
        Article.destroy '5086df098523e60002000018', (err) ->
          db.articles.count (err, count) ->
            count.should.equal 10
            done()

  describe '#present', ->

    it 'converts _id to id', ->
      data = Article.present _.extend fixtures().articles, _id: 'foo'
      (data._id?).should.not.be.ok
      data.id.should.equal 'foo'

  describe '#presentCollection', ->

    it 'shows a total/count/results hash for arrays of articles', ->
      data = Article.presentCollection
        total: 10
        count: 1
        results: [_.extend fixtures().articles, _id: 'baz']
      data.results[0].id.should.equal 'baz'

  describe '#syncToPost', ->

    app = express()
    app.use bodyParser.urlencoded()
    app.use bodyParser.json()
    posts = {}
    app.post '/api/v1/post', (req, res) ->
      posts['54276766fd4f50996aeca2b8'] = post = _.extend(
        fabricateGravity('post')
        req.body
        {
          attachments: [{"artwork":{"artist":{"_id":"4f5f64c23b555230ac000472","id":"carlos-motta","sortable_id":"motta-carlos","name":"Carlos Motta","years":"born 1978","public":true,"birthday":"1978","nationality":"Colombian","published_artworks_count":45,"forsale_artworks_count":36,"artworks_count":68,"image_url":"http://static2.artsy.net/artist_images/52f6be0d4a04f5d504f6d7b0/:version.jpg","image_versions":["square","tall","large","four_thirds"],"image_urls":{"square":"http://static2.artsy.net/artist_images/52f6be0d4a04f5d504f6d7b0/square.jpg","tall":"http://static2.artsy.net/artist_images/52f6be0d4a04f5d504f6d7b0/tall.jpg","large":"http://static2.artsy.net/artist_images/52f6be0d4a04f5d504f6d7b0/large.jpg","four_thirds":"http://static2.artsy.net/artist_images/52f6be0d4a04f5d504f6d7b0/four_thirds.jpg"},"original_height":null,"original_width":null},"partner":{"_id":"5314b1f67622dd639900006d","id":"future-generation-art-prize","default_profile_id":"futuregenerationartprize","default_profile_public":true,"sortable_id":"future-generation-art-prize","type":"Non Profit","name":"Future Generation Art Prize","short_name":null,"website":"http://www.futuregenerationartprize.org/en","has_full_profile":true},"images":[{"id":"5457afac7261692d54710100","position":1,"aspect_ratio":1.57,"downloadable":false,"original_height":1912,"original_width":3000,"is_default":true,"image_versions":["small","square","medium","medium_rectangle","large_rectangle","tall","large","larger","normalized"],"image_url":"http://static3.artsy.net/additional_images/5457afac7261692d54710100/:version.jpg","image_urls":{"small":"http://static3.artsy.net/additional_images/5457afac7261692d54710100/small.jpg","square":"http://static3.artsy.net/additional_images/5457afac7261692d54710100/square.jpg","medium":"http://static3.artsy.net/additional_images/5457afac7261692d54710100/medium.jpg","medium_rectangle":"http://static3.artsy.net/additional_images/5457afac7261692d54710100/medium_rectangle.jpg","large_rectangle":"http://static3.artsy.net/additional_images/5457afac7261692d54710100/large_rectangle.jpg","tall":"http://static3.artsy.net/additional_images/5457afac7261692d54710100/tall.jpg","large":"http://static3.artsy.net/additional_images/5457afac7261692d54710100/large.jpg","larger":"http://static3.artsy.net/additional_images/5457afac7261692d54710100/larger.jpg","normalized":"http://static3.artsy.net/additional_images/5457afac7261692d54710100/normalized.jpg"},"tile_size":512,"tile_overlap":0,"tile_format":"jpg","tile_base_url":"http://static0.artsy.net/additional_images/5457afac7261692d54710100/dztiles-512-0","max_tiled_height":1912,"max_tiled_width":3000}],"artists":[{"_id":"4f5f64c23b555230ac000472","id":"carlos-motta","sortable_id":"motta-carlos","name":"Carlos Motta","years":"born 1978","public":true,"birthday":"1978","nationality":"Colombian","published_artworks_count":45,"forsale_artworks_count":36,"artworks_count":68,"image_url":"http://static2.artsy.net/artist_images/52f6be0d4a04f5d504f6d7b0/:version.jpg","image_versions":["square","tall","large","four_thirds"],"image_urls":{"square":"http://static2.artsy.net/artist_images/52f6be0d4a04f5d504f6d7b0/square.jpg","tall":"http://static2.artsy.net/artist_images/52f6be0d4a04f5d504f6d7b0/tall.jpg","large":"http://static2.artsy.net/artist_images/52f6be0d4a04f5d504f6d7b0/large.jpg","four_thirds":"http://static2.artsy.net/artist_images/52f6be0d4a04f5d504f6d7b0/four_thirds.jpg"},"original_height":null,"original_width":null}],"_id":"5457afa87261697d13930300","id":"carlos-motta-la-vision-de-los-vencidos-the-defeated","title":"La visión de los vencidos (The Defeated)","display":"Carlos Motta, La visión de los vencidos (The Defeated) (2013)","manufacturer":null,"category":"Mixed Media","medium":"Video HD, colour, sound, 6’ 46’’","unique":false,"forsale":false,"sold":false,"date":"2013","dimensions":{"in":null,"cm":null},"price":"","availability":"not for sale","ecommerce":false,"collecting_institution":"","blurb":"","edition_sets_count":0,"published":true,"price_currency":"USD","sale_message":null,"inquireable":false,"acquireable":false,"published_at":"2014-11-12T21:29:08+00:00","can_share":true,"can_share_image":true,"cultural_maker":null},"id":"548367187261691319240400","type":"PostArtwork","position":1}]
          artworks: []
          _id: '54276766fd4f50996aeca2b8'
        }
      )
      res.send post
    app.delete '/api/v1/post/:id/link/:linkId', (req, res) ->
      posts[req.params.id].content_links = []
      res.send {}
    app.delete '/api/v1/post/:id/artwork/:artworkId', (req, res) ->
      posts[req.params.id].artworks = []
      res.send {}
    app.post "/api/v1/post/:id/artwork/:artworkId", (req, res) ->
      posts[req.params.id].artworks.push { id: req.params.artworkId }
      res.send {}
    app.post "/api/v1/post/:id/link", (req, res) ->
      posts[req.params.id].content_links.push req.body
      res.send {}
    app.get '/api/v1/post/:id', (req, res) ->
      res.send posts[req.params.id]

    beforeEach (done) ->
      Article.__set__ 'ARTSY_URL', 'http://localhost:5001'
      @server = app.listen 5001, -> done()

    afterEach ->
      @server.close()

    it 'saves an article to a gravity post', (done) ->
      article = _.extend fixtures().articles, gravity_id: null
      article.sections[3].ids = ['foo', 'bar']
      Article.syncToPost article, 'foo-token', (err, post) ->
        post.title.should.equal article.title
        post.body.should.equal 'Just before the lines start forming...<p><h1>10. Lisson Gallery</h1></p><p>Mia Bergeron merges the <em>personal</em> and <em>universal</em>...Check out this video art:'
        post.published.should.be.ok
        _.pluck(post.artworks, 'id').join('').should.equal 'foobar'
        _.pluck(post.content_links, 'url').join('').should.equal 'http://gemini.herokuapp.com/123/miaart-banner.jpghttp://youtu.be/yYjLrJRuMnY'
        done()

    it 'saves the gravity slug for lookup', (done) ->
      article = _.extend fixtures().articles, gravity_id: null
      Article.syncToPost article, 'foo-token', (err, post) ->
        db.articles.find {}, (err, articles) ->
          _.last(_.last(articles).slugs).should.equal 'billpowers-check-out-the-original-flowers-photograph-taken-by-patricia'
          done()

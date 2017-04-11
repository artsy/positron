_ = require 'underscore'
rewire = require 'rewire'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../../test/helpers/db'
Article = rewire '../../model/index'
{ ObjectId } = require 'mongojs'
express = require 'express'
gravity = require('antigravity').server
app = require('express')()
sinon = require 'sinon'
search = require '../../../../lib/elasticsearch'

describe 'Index Where', ->

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

  describe '#where', ->

    it 'can return all articles along with total and counts', (done) ->
      Article.where { count: true }, (err, res) ->
        { total, count, results } = res
        total.should.equal 10
        count.should.equal 10
        results[0].title.should.equal 'Top Ten Booths'
        done()

    it 'can return all articles along with total and counts', (done) ->
      Article.where {}, (err, res) ->
        { total, count, results } = res
        total?.should.be.false()
        count?.should.be.false()
        results[0].title.should.equal 'Top Ten Booths'
        done()

    it 'can return articles by an author', (done) ->
      fabricate 'articles', {
        author_id: aid = ObjectId '4d8cd73191a5c50ce220002a'
        title: 'Hello Wurld'
      }, ->
        Article.where { author_id: aid.toString(), count: true }, (err, res) ->
          { total, count, results } = res
          total.should.equal 11
          count.should.equal 1
          results[0].title.should.equal 'Hello Wurld'
          done()

    it 'can return articles by published', (done) ->
      fabricate 'articles', _.times(3, -> { published: false, title: 'Moo baz' }), ->
        Article.where { published: false, count: true }, (err, { total, count, results }) ->
          total.should.equal 13
          count.should.equal 3
          results[0].title.should.equal 'Moo baz'
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

    it 'can find articles added to multiple fairs', (done) ->
      fabricate 'articles', [
        { title: 'C', fair_ids: [ObjectId('4dc98d149a96300001003033')] }
        { title: 'A', fair_ids: [ObjectId('4dc98d149a96300001003033')]  }
        { title: 'B', fair_ids: [ObjectId('4dc98d149a96300001003032')]  }
      ], ->
        Article.where(
          { fair_ids: ['4dc98d149a96300001003033', '4dc98d149a96300001003032'] }
          (err, { results }) ->
            _.pluck(results, 'title').sort().join('').should.equal 'ABC'
            done()
        )

    it 'can find articles by a fair', (done) ->
      fabricate 'articles', [
        { title: 'C', fair_ids: [ObjectId('4dc98d149a96300001003033')] }
        { title: 'A', fair_ids: [ObjectId('4dc98d149a96300001003033')] }
      ], ->
        Article.where(
          { fair_id: '4dc98d149a96300001003033' }
          (err, { results }) ->
            _.pluck(results, 'title').sort().join('').should.equal 'AC'
            done()
        )

    it 'can return articles by a fair programming id', (done) ->
      fabricate 'articles', {
        author_id: aid = ObjectId '4d8cd73191a5c50ce220002a'
        title: 'Hello Wurld'
        fair_programming_ids: [ ObjectId('52617c6c8b3b81f094000013') ]
      }, ->
        Article.where { fair_programming_id: '52617c6c8b3b81f094000013', count: true }, (err, res) ->
          { total, count, results } = res
          total.should.equal 11
          count.should.equal 1
          results[0].title.should.equal 'Hello Wurld'
          done()

    it 'can return articles by a fair artsy id', (done) ->
      fabricate 'articles', {
        author_id: aid = ObjectId '4d8cd73191a5c50ce220002a'
        title: 'Hello Wurld'
        fair_artsy_ids: [ ObjectId('53da550a726169083c0a0700') ]
      }, ->
        Article.where { fair_artsy_id: '53da550a726169083c0a0700', count: true }, (err, res) ->
          { total, count, results } = res
          total.should.equal 11
          count.should.equal 1
          results[0].title.should.equal 'Hello Wurld'
          done()

    it 'can return articles by a fair about id', (done) ->
      fabricate 'articles', {
        author_id: aid = ObjectId '4d8cd73191a5c50ce220002a'
        title: 'Hello Wurld'
        fair_about_ids: [ ObjectId('53da550a726169083c0a0700') ]
      }, ->
        Article.where { fair_about_id: '53da550a726169083c0a0700', count: true }, (err, res) ->
          { total, count, results } = res
          total.should.equal 11
          count.should.equal 1
          results[0].title.should.equal 'Hello Wurld'
          done()

    it 'can find articles added to a partner', (done) ->
      fabricate 'articles', [
        { title: 'Foo', partner_ids: [ObjectId('4dc98d149a96300001003033')] }
        { title: 'Bar', partner_ids: [ObjectId('4dc98d149a96300001003033')] }
        { title: 'Baz', partner_ids: [ObjectId('4dc98d149a96300001003031')] }
      ], ->
        Article.where(
          { partner_id: '4dc98d149a96300001003033' }
          (err, { results }) ->
            _.pluck(results, 'title').sort().join('').should.equal 'BarFoo'
            done()
        )

    it 'can find articles by query', (done) ->
      fabricate 'articles', [
        { thumbnail_title: 'Foo' }
        { thumbnail_title: 'Bar' }
        { thumbnail_title: 'Baz' }
      ], ->
        Article.where(
          { q: 'fo' }
          (err, { results }) ->
            results[0].thumbnail_title.should.equal 'Foo'
            done()
        )

    it 'can find articles by all_by_author', (done) ->
      fabricate 'articles', [
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002a'
          contributing_authors: [ {id: ObjectId '4d8cd73191a5c50ce220002b'}]
          title: 'Hello Wurld'
        }
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002b'
          title: 'Hello Waaarld'
        }
      ], =>
        Article.where { all_by_author: '4d8cd73191a5c50ce220002b', count: true }, (err, res) ->
          { total, count, results } = res
          total.should.equal 12
          count.should.equal 2
          results[0].title.should.equal 'Hello Waaarld'
          results[1].title.should.equal 'Hello Wurld'
          done()

    it 'can find articles by super article', (done) ->
      fabricate 'articles', [
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002a'
          title: 'Hello Wurld'
          is_super_article: false
        }
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002b'
          title: 'Hello Waaarldie'
          is_super_article: true
        }
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002b'
          title: 'Hello Waaarld'
        }
      ], =>
        Article.where { is_super_article: true, count: true }, (err, res) ->
          { total, count, results } = res
          total.should.equal 13
          count.should.equal 1
          results[0].title.should.equal 'Hello Waaarldie'
          done()

    it 'can find super article by article (opposite of the above test!)', (done) ->
      superArticleId = ObjectId '4d7ab73191a5c50ce220001c'
      childArticleId = ObjectId '4d8cd73191a5c50ce111111a'
      fabricate 'articles', [
        {
          _id: childArticleId
          author_id: ObjectId '4d8cd73191a5c50ce220002a'
          title: 'Child Article'
          is_super_article: false
        }
        {
          _id: superArticleId
          author_id: ObjectId '4d8cd73191a5c50ce220002b'
          title: 'Super Article'
          is_super_article: true
          super_article:
            related_articles: [childArticleId]
        }
      ], =>
        Article.where { super_article_for: childArticleId.toString(), count: true }, (err, res) ->
          { total, count, results } = res
          total.should.equal 12
          count.should.equal 1
          results[0].title.should.equal 'Super Article'
          done()

    it 'can find articles by tags', (done) ->
      fabricate 'articles', [
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002a'
          tags: [ 'pickle', 'samosa' ]
          title: 'Hello Wuuuurld - Food'
        }
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002b'
          tags: [ 'pickle', 'muffin' ]
          title: 'Hello Waaarld - Food'
        }
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002c'
          tags: [ 'muffin', 'lentils' ]
          title: 'Hello Weeeerld - Food'
        }
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002e'
          tags: [ 'radio', 'pixels' ]
          title: 'Hello I am Weiiird - Electronics'
        }
      ], =>
        Article.where { tags: ['pickle', 'muffin'], count: true }, (err, res) ->
          { total, count, results } = res
          total.should.equal 14
          count.should.equal 3
          results[0].title.should.equal 'Hello Weeeerld - Food'
          results[1].title.should.equal 'Hello Waaarld - Food'
          results[2].title.should.equal 'Hello Wuuuurld - Food'
          done()

    it 'can find articles by artist biography', (done) ->
      fabricate 'articles', [
        {
          title: 'Hello Wurld'
          published: true
          biography_for_artist_id: ObjectId '5086df098523e60002000016'
        }
      ], ->
        Article.where {
          published: true
          biography_for_artist_id: '5086df098523e60002000016'
          count: true
        }, (err, res) ->
          { total, count, results } = res
          count.should.equal 1
          results[0].title.should.equal 'Hello Wurld'
          done()

    it 'can find articles by channel_id', (done) ->
      fabricate 'articles', [
        {
          title: 'Hello Wurld'
          published: true
          channel_id: ObjectId '5086df098523e60002000016'
        }
      ], ->
        Article.where {
          published: true
          channel_id: '5086df098523e60002000016'
          count: true
        }, (err, res) ->
          { total, count, results } = res
          count.should.equal 1
          results[0].title.should.equal 'Hello Wurld'
          done()

    it 'can find articles by partner_channel_id', (done) ->
      fabricate 'articles', [
        {
          title: 'Hello Wurld'
          published: true
          partner_channel_id: ObjectId '5086df098523e60002000016'
        }
      ], ->
        Article.where {
          published: true
          channel_id: '5086df098523e60002000016'
          count: true
        }, (err, res) ->
          { total, count, results } = res
          count.should.equal 1
          results[0].title.should.equal 'Hello Wurld'
          done()

    it 'can find articles by scheduled', (done) ->
      fabricate 'articles', [
        {
          title: 'Hello Wurld'
          published: false
          scheduled_publish_at: '555'
        }
      ], ->
        Article.where {
          scheduled: true
          count: true
        }, (err, res) ->
          { total, count, results } = res
          count.should.equal 1
          results[0].title.should.equal 'Hello Wurld'
          done()

    it 'can find articles by internal tags', (done) ->
      fabricate 'articles', [
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002a'
          internal_tags: [ 'pickle', 'samosa' ]
          title: 'Hello Wuuuurld - Food'
        }
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002b'
          internal_tags: [ 'pickle', 'muffin' ]
          title: 'Hello Waaarld - Food'
        }
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002c'
          internal_tags: [ 'muffin', 'lentils' ]
          title: 'Hello Weeeerld - Food'
        }
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002e'
          internal_tags: [ 'radio', 'pixels' ]
          title: 'Hello I am Weiiird - Electronics'
        }
      ], =>
        Article.where { internal_tags: ['pickle', 'muffin'], count: true }, (err, res) ->
          { total, count, results } = res
          total.should.equal 14
          count.should.equal 3
          results[0].title.should.equal 'Hello Weeeerld - Food'
          results[1].title.should.equal 'Hello Waaarld - Food'
          results[2].title.should.equal 'Hello Wuuuurld - Food'
          done()

    it 'can find articles by a vertical', (done) ->
      fabricate 'articles', [
        {
          title: 'Art History 101'
          vertical: 'Art'
          sub_vertical: 'Art History'
        }
      ], ->
        Article.where {
          count: true
          vertical: 'Art'
        }, (err, res) ->
          { total, count, results } = res
          count.should.equal 1
          total.should.equal 11
          results[0].title.should.equal 'Art History 101'
          results[0].vertical.should.equal 'Art'
          done()

    it 'can find articles by a sub_vertical', (done) ->
      fabricate 'articles', [
        {
          title: 'Art History 102'
          sub_vertical: 'Art History'
        },
        {
          title: 'Art History 101'
          sub_vertical: 'Art History'
        },
        {
          title: 'Art Workshop'
          sub_vertical: 'Art Workshops'
        }
      ], ->
        Article.where {
          count: true
          sub_vertical: 'Art History'
        }, (err, res) ->
          { total, count, results } = res
          count.should.equal 2
          total.should.equal 13
          results[0].title.should.equal 'Art History 101'
          results[1].title.should.equal 'Art History 102'
          results[0].sub_vertical.should.equal 'Art History'
          results[1].sub_vertical.should.equal 'Art History'
          done()

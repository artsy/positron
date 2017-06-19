_ = require 'underscore'
rewire = require 'rewire'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../../test/helpers/db'
Article = rewire '../../model/index'
{ ObjectId } = require 'mongojs'
express = require 'express'
fabricateGravity = require('antigravity').fabricate
gravity = require('antigravity').server
app = require('express')()
bodyParser = require 'body-parser'
sinon = require 'sinon'
search = require '../../../../lib/elasticsearch'

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

    it 'can find articles by tracking_tags', (done) ->
      fabricate 'articles', [
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002a'
          tracking_tags: [ 'video', 'evergreen' ]
          title: 'The Shanghai Art Project That’s Working to Save Us from a Dystopian Future'
        }
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002b'
          tracking_tags: [ 'video', 'evergreen' ]
          title: '$448 Million Christie’s Post-War and Contemporary Sale Led by Bacon and Twombly'
        }
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002c'
          tracking_tags: [ 'podcast', 'evergreen' ]
          title: '8 Works to Collect at ARCOlisboa'
        }
        {
          author_id: ObjectId '4d8cd73191a5c50ce220002e'
          tracking_tags: [ 'op-eds', 'explainers' ]
          title: 'NYC Releases Data That Will Help Shape the City’s Cultural Future'
        }
      ], =>
        Article.where { tracking_tags: ['video', 'evergreen'], count: true }, (err, res) ->
          { total, count, results } = res
          total.should.equal 14
          count.should.equal 3
          results[0].title.should.equal '8 Works to Collect at ARCOlisboa'
          results[1].title.should.equal '$448 Million Christie’s Post-War and Contemporary Sale Led by Bacon and Twombly'
          results[2].title.should.equal 'The Shanghai Art Project That’s Working to Save Us from a Dystopian Future'
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

    it 'can return articles by indexable', (done) ->
      fabricate 'articles', _.times(3, -> { indexable: false, title: 'Moo baz' }), ->
        Article.where { indexable: true, count: true }, (err, { total, count, results }) ->
          total.should.equal 13
          count.should.equal 10
          results[0].title.should.not.equal 'Moo baz'
          done()

    it 'can return articles by not indexable', (done) ->
      fabricate 'articles', _.times(3, -> { indexable: false, title: 'Moo baz' }), ->
        Article.where { indexable: false, count: true }, (err, { total, count, results }) ->
          total.should.equal 13
          count.should.equal 3
          results[0].title.should.equal 'Moo baz'
          done()

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
        id: '5086df098523e60002002222'
        channel_id: '5086df098523e60002002223'
        vertical: {name: 'Culture', id: '55356a9deca560a0137bb4a7'}
      }, 'foo', (err, article) ->
        article.title.should.equal 'Top Ten Shows'
        article.channel_id.toString().should.equal '5086df098523e60002002223'
        article.vertical.name.should.eql 'Culture'
        db.articles.count (err, count) ->
          count.should.equal 11
          done()

    it 'requires an author', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
      }, 'foo', (err, article) ->
        err.message.should.containEql '"author_id" is required'
        done()

    it 'adds an updated_at as a date', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
      }, 'foo', (err, article) ->
        article.updated_at.should.be.an.instanceOf(Date)
        moment(article.updated_at).format('YYYY-MM-DD').should.equal moment().format('YYYY-MM-DD')
        done()

    it 'input updated_at must be a date', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
        updated_at: 'foo'
      }, 'foo', (err, article) ->
        err.message.should.containEql '"updated_at" must be a number of milliseconds or valid date string'
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
        updated_at: new Date
      }, 'foo', (err, article) ->
        moment(article.updated_at).format('YYYY-MM-DD').should.equal moment().format('YYYY-MM-DD')
        done()

    it 'includes the id for a new article', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
      }, 'foo', (err, article) ->
        return done err if err
        (article._id?).should.be.ok
        done()

    it 'adds a slug based off the thumbnail title', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
        author: name: 'Craig Spaeth'
      }, 'foo', (err, article) ->
        return done err if err
        article.slugs[0].should.equal 'craig-spaeth-ten-shows'
        done()

    it 'adds a slug based off a user and thumbnail title', (done) ->
      fabricate 'users', { name: 'Molly'}, (err, @user) ->
        Article.save {
          thumbnail_title: 'Foo Baz'
          author_id: @user._id
          author: name: @user.name
        }, 'foo', (err, article) ->
          return done err if err
          article.slugs[0].should.equal 'molly-foo-baz'
          done()

    it 'saves slug history when publishing', (done) ->
      fabricate 'users', { name: 'Molly'}, (err, @user) ->
        Article.save {
          thumbnail_title: 'Foo Baz'
          author_id: @user._id
          published: false
          author: name: @user.name
        }, 'foo', (err, article) =>
          return done err if err
          Article.save {
            id: article._id.toString()
            thumbnail_title: 'Foo Bar Baz'
            author_id: @user._id
            published: true
            author: name: @user.name
          }, 'foo', (err, article) ->
            return done err if err
            article.slugs.join('').should.equal 'molly-foo-bazmolly-foo-bar-baz'
            Article.find article.slugs[0], (err, article) ->
              article.thumbnail_title.should.equal 'Foo Bar Baz'
              done()

    it 'appends the date to an article URL when its slug already exists', (done) ->
      fabricate 'articles', {
        id: '5086df098523e60002002222'
        slugs: ['craig-spaeth-heyo']
        author: name: 'Craig Spaeth'
      }, ->
        Article.save {
          thumbnail_title: 'heyo'
          author_id: '5086df098523e60002000018'
          published_at: '01-01-99'
          id: '5086df098523e60002002222'
          author: name: 'Craig Spaeth'
          }, 'foo', (err, article) ->
            return done err if err
            article.slugs[0].should.equal 'craig-spaeth-heyo-01-01-99'
            db.articles.count (err, count) ->
              count.should.equal 12
              done()

    it 'saves published_at when the article is published', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
        published: true
        id: '5086df098523e60002002222'
      }, 'foo', (err, article) ->
        article.published_at.should.be.an.instanceOf(Date)
        moment(article.published_at).format('YYYY').should
          .equal moment().format('YYYY')
        done()

    it 'updates published_at when admin changes it', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
        published: true
      }, 'foo', (err, article) =>
        return done err if err
        Article.save {
          id: article._id.toString()
          author_id: '5086df098523e60002000018'
          published_at: moment().add(1, 'year').toDate()
        }, 'foo', (err, updatedArticle) ->
          return done err if err
          updatedArticle.published_at.should.be.an.instanceOf(Date)
          moment(updatedArticle.published_at).format('YYYY').should
            .equal moment().add(1, 'year').format('YYYY')
          done()

    it 'saves indexable when the article is published', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
        published: true
        id: '5086df098523e60002002222'
      }, 'foo', (err, article) ->
        article.indexable.should.eql true
        done()

    it 'updates indexable when admin changes it', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
      }, 'foo', (err, article) =>
        return done err if err
        article.indexable.should.eql true
        Article.save {
          id: article._id.toString()
          author_id: '5086df098523e60002000018'
          indexable: false
        }, 'foo', (err, updatedArticle) ->
          return done err if err
          updatedArticle.indexable.should.eql false
          done()

    it 'doesnt save a fair unless explictly set', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
        fair_ids: []
        published: true
      }, 'foo', (err, article) ->
        (article.fair_ids?).should.not.be.ok
        done()

    it 'escapes xss', (done) ->
      body = '<h2>Hi</h2><h3>Hello</h3><p><b>Hola</b></p><p><i>Guten Tag</i></p><ol><li>Bonjour<br></li><li><a href="http://www.foo.com">Bonjour2</a></li></ol><ul><li>Aloha</li><li>Aloha Again</li></ul><h2><b><i>Good bye</i></b></h2><p><b><i>Adios</i></b></p><h3>Alfiederzen</h3><p><a href="http://foo.com">Aloha</a></p>'
      badBody = '<script>alert(foo)</script><h2>Hi</h2><h3>Hello</h3><p><b>Hola</b></p><p><i>Guten Tag</i></p><ol><li>Bonjour<br></li><li><a href="http://www.foo.com">Bonjour2</a></li></ol><ul><li>Aloha</li><li>Aloha Again</li></ul><h2><b><i>Good bye</i></b></h2><p><b><i>Adios</i></b></p><h3>Alfiederzen</h3><p><a href="http://foo.com">Aloha</a></p>'
      Article.save {
        id: '5086df098523e60002000018'
        author_id: '5086df098523e60002000018'
        hero_section:
          type: 'image'
          caption: '<p>abcd abcd</p><svg/onload=alert(1)>'
        lead_paragraph: '<p>abcd abcd</p><svg/onload=alert(1)>'
        sections: [
          {
            type: 'text'
            body: body
          }
          {
            type: 'text'
            body: badBody
          }
          {
            type: 'image'
            caption: '<p>abcd abcd</p><svg/onload=alert(1)>'
          }
          {
            type: 'slideshow'
            items: [
              {
                type: 'image'
                caption: '<p>abcd abcd</p><svg/onload=alert(1)>'
              }
            ]
          }
          {
            type: 'embed'
            url: 'http://maps.google.com'
            height: '400'
            mobile_height: '300'
          }
        ]
      }, 'foo', (err, article) ->
        article.lead_paragraph.should.equal '<p>abcd abcd</p>&lt;svg onload="alert(1)"/&gt;'
        article.hero_section.caption.should.equal '<p>abcd abcd</p>&lt;svg onload="alert(1)"/&gt;'
        article.sections[0].body.should.equal body
        article.sections[1].body.should.equal '&lt;script&gt;alert(foo)&lt;/script&gt;' + body
        article.sections[2].caption.should.equal '<p>abcd abcd</p>&lt;svg onload="alert(1)"/&gt;'
        article.sections[3].items[0].caption.should.equal '<p>abcd abcd</p>&lt;svg onload="alert(1)"/&gt;'
        article.sections[4].url.should.equal 'http://maps.google.com'
        article.sections[4].height.should.equal '400'
        article.sections[4].mobile_height.should.equal '300'
        done()

    it 'doesnt escape smart quotes', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        title: 'Dr. Evil demands “one million dollars”.'
        thumbnail_title: 'Dr. Evil demands “one billion dollars”.'
      }, 'foo', (err, article) ->
        article.title.should.containEql '“'
        article.thumbnail_title.should.containEql '“'
        done()

    it 'fixes anchors urls', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        sections: [
          {
            type: 'text'
            body: '<a href="foo.com">Foo</a>'
          }
          {
            type: 'text'
            body: '<a href="www.bar.com">Foo</a>'
          }
        ]
      }, 'foo', (err, article) ->
        article.sections[0].body.should.equal '<a href="http://foo.com">Foo</a>'
        article.sections[1].body.should.equal '<a href="http://www.bar.com">Foo</a>'
        done()

    it 'retains non-text sections', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        sections: [
          {
            type: 'text'
            body: '<a href="foo.com">Foo</a>'
          }
          {
            type: 'image'
            url: 'http://foo.com'
          }
          {
            type: 'video'
            url: 'foo.com/watch'
          }
          {
            type: 'slideshow'
            items: [
              {
                type: 'video'
                url: 'foo.com/watch'
              }
            ]
          }
        ]
      }, 'foo', (err, article) ->
        article.sections[0].body.should.equal '<a href="http://foo.com">Foo</a>'
        article.sections[1].url.should.equal 'http://foo.com'
        article.sections[2].url.should.equal 'http://foo.com/watch'
        article.sections[3].items[0].url.should.equal 'http://foo.com/watch'
        done()

    it 'maintains the original slug when publishing with a new title', (done) ->
      fabricate 'users', { name: 'Molly'}, (err, @user) ->
        Article.save {
          thumbnail_title: 'Foo Baz'
          author_id: @user._id
          published: true
          author: name: @user.name
        }, 'foo', (err, article) =>
          return done err if err
          Article.save {
            id: article._id.toString()
            thumbnail_title: 'Foo Bar Baz'
            author_id: @user._id
            published: true
          }, 'foo', (err, article) ->
            return done err if err
            article.slugs.join('').should.equal 'molly-foo-baz'
            article.thumbnail_title.should.equal 'Foo Bar Baz'
            done()

    it 'generates keywords on publish', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        primary_featured_artist_ids: ['4d8b92b34eb68a1b2c0003f4']
        featured_artist_ids: ['52868347b202a37bb000072a']
        fair_ids: ['5530e72f7261696238050000']
        partner_ids: ['4f5228a1de92d1000100076e']
        tags: ['cool', 'art']
        contributing_authors: [{name: 'kana'}]
        published: true
      }, 'foo', (err, article) ->
        return done err if err
        article.keywords.join(',').should.equal 'cool,art,Pablo Picasso,Pablo Picasso,Armory Show 2013,Gagosian Gallery,kana'
        done()

    it 'indexes the article in elasticsearch on save', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        title: 'foo article'
        published: true
        channel_id: '5086df098523e60002000018'
      }, 'foo', (err, article) ->
        return done err if err
        setTimeout( =>
          search.client.search(
            index: search.index
            q: 'name:foo'
            , (error, response) ->
              response.hits.hits[0]._source.name.should.equal 'foo article'
              response.hits.hits[0]._source.visible_to_public.should.equal true
              done()
          )
        , 1000)

    it 'saves Super Articles', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        is_super_article: true
        super_article: {
          partner_link: 'http://partnerlink.com'
          partner_logo: 'http://partnerlink.com/logo.jpg'
          partner_fullscreen_header_logo: 'http://partnerlink.com/blacklogo.jpg'
          partner_link_title: 'Download The App'
          partner_logo_link: 'http://itunes'
          secondary_partner_logo: 'http://secondarypartner.com/logo.png'
          secondary_logo_text: 'In Partnership With'
          secondary_logo_link: 'http://secondary'
          footer_blurb: 'This is a Footer Blurb'
          related_articles: [ '5530e72f7261696238050000' ]
        }
        published: true
      }, 'foo', (err, article) ->
        return done err if err
        article.super_article.partner_link.should.equal 'http://partnerlink.com'
        article.super_article.partner_logo.should.equal 'http://partnerlink.com/logo.jpg'
        article.super_article.partner_link_title.should.equal 'Download The App'
        article.super_article.partner_logo_link.should.equal 'http://itunes'
        article.super_article.partner_fullscreen_header_logo.should.equal 'http://partnerlink.com/blacklogo.jpg'
        article.super_article.secondary_partner_logo.should.equal 'http://secondarypartner.com/logo.png'
        article.super_article.secondary_logo_text.should.equal 'In Partnership With'
        article.super_article.secondary_logo_link.should.equal 'http://secondary'
        article.super_article.footer_blurb.should.equal 'This is a Footer Blurb'
        article.is_super_article.should.equal true
        article.super_article.related_articles.length.should.equal 1
        done()

    it 'type casts ObjectId over articles', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        super_article: {
          related_articles: [ '5530e72f7261696238050000' ]
        }
        published: true
        fair_programming_ids: [ '52617c6c8b3b81f094000013' ]
        fair_artsy_ids: [ '53da550a726169083c0a0700' ]
        fair_about_ids: [ '53da550a726169083c0a0700' ]
      }, 'foo', (err, article) ->
        return done err if err
        (article.author_id instanceof ObjectId).should.be.true()
        (article.super_article.related_articles[0] instanceof ObjectId).should.be.true()
        done()

    it 'saves a callout section', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        sections: [
          {
            type: 'callout'
            text: 'The Title Goes Here'
            article: ''
            thumbnail_url: 'http://image.jpg'
            hide_image: false
          },
          {
            type: 'text'
            body: 'badBody'
          },
          {
            type: 'callout'
            text: ''
            article: '53da550a726169083c0a0700'
            thumbnail_url: ''
          },
          {
            type: 'text'
            body: 'badBody'
          }
        ]
        published: true
      }, 'foo', (err, article) ->
        return done err if err
        article.sections[0].type.should.equal 'callout'
        article.sections[0].text.should.equal 'The Title Goes Here'
        article.sections[0].thumbnail_url.should.equal 'http://image.jpg'
        article.sections[1].type.should.equal 'text'
        article.sections[3].type.should.equal 'text'
        article.sections[2].article.should.equal '53da550a726169083c0a0700'
        done()

    it 'saves an article that does not have sections in input', (done) ->
      fabricate 'articles',
        _id: ObjectId('5086df098523e60002000018')
        id: '5086df098523e60002000018'
        author_id: ObjectId('5086df098523e60002000018')
        published: false
        author: {
          name: 'Kana Abe'
        }
        sections: [
          {
            type: 'text'
            body: 'The start of a new article'
          }
          {
            type: 'image'
            url: 'https://image.png'
            caption: 'Trademarked'
          }
        ]
      , ->
        Article.save {
          _id: ObjectId('5086df098523e60002000018')
          id: '5086df098523e60002000018'
          author_id: '5086df098523e60002000018'
          published: true
        }, 'foo', (err, article) ->
          article.published.should.be.true()
          article.sections.length.should.equal 2
          article.sections[0].body.should.containEql 'The start of a new article'
          done()

    it 'saves a TOC section', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        sections: [
          {
            type: 'toc'
            links: [
              { name: 'kana', value: 'Kana' }
              { name: 'andy warhol', value: 'Andy Warhol' }
            ]
          }
        ]
        published: true
      }, 'foo', (err, article) ->
        return done err if err
        article.sections[0].type.should.equal 'toc'
        article.sections[0].links[0].name.should.equal 'kana'
        article.sections[0].links[0].value.should.equal 'Kana'
        article.sections[0].links[1].name.should.equal 'andy warhol'
        article.sections[0].links[1].value.should.equal 'Andy Warhol'
        done()

    it 'saves an image set section', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        sections: [
          {
            type: 'image_set'
            images: [
              {
                type: 'image'
                url: 'https://image.png'
                caption: 'Trademarked'
              }
              {
                type: 'artwork'
                id: '123'
                slug: 'andy-warhol'
                title: 'The Piece'
                date: '2015-04-01'
                image: 'http://image.png'
              }
            ]
          }
        ]
      }, 'foo', (err, article) ->
        return done err if err
        article.sections[0].type.should.equal 'image_set'
        article.sections[0].images[0].type.should.equal 'image'
        article.sections[0].images[0].url.should.equal 'https://image.png'
        article.sections[0].images[1].type.should.equal 'artwork'
        article.sections[0].images[1].id.should.equal '123'
        article.sections[0].images[1].slug.should.equal 'andy-warhol'
        done()

    it 'saves layouts', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        layout: 'left'
      }, 'foo', (err, article) ->
        return done err if err
        article.layout.should.equal 'left'
        done()

    it 'it defaults to center if layout is not specified', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
      }, 'foo', (err, article) ->
        return done err if err
        article.layout.should.equal 'center'
        done()

    it 'saves the channel_id', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        channel_id: '5086df098523e60002000015'
      }, 'foo', (err, article) ->
        return done err if err
        article.channel_id.toString().should.equal '5086df098523e60002000015'
        done()

    it 'saves the partner_channel_id', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        partner_channel_id: '5086df098523e60002000015'
      }, 'foo', (err, article) ->
        return done err if err
        article.partner_channel_id.toString().should.equal '5086df098523e60002000015'
        done()

    it 'saves the author', (done) ->
      Article.save {
        author:
          name: 'Jon Snow'
          id: '5086df098523e60002000018'
        author_id: '5086df098523e60002000018'
      }, 'foo', (err, article) ->
        return done err if err
        article.author.id.toString().should.equal '5086df098523e60002000018'
        article.author.name.should.equal 'Jon Snow'
        done()

    it 'saves a description', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        channel_id: '5086df098523e60002000015'
        description: 'Just before the lines start forming, we predict where they will go.'
      }, 'foo', (err, article) ->
        return done err if err
        article.description.should.containEql 'lines start forming'
        done()

    it 'saves verticals', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        vertical: {name: 'Culture', id: '4d8b92b34eb68a1b2c0003f4'}
      }, 'foo', (err, article) ->
        return done err if err
        article.vertical.name.should.eql 'Culture'
        done()

    it 'saves tracking_tags', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        tracking_tags: ['evergreen', 'video']
      }, 'foo', (err, article) ->
        return done err if err
        article.tracking_tags.should.eql ['evergreen', 'video']
        done()

    it 'saves social metadata', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        channel_id: '5086df098523e60002000015'
        social_title: 'social title'
        social_description: 'social description'
        social_image: 'social image'
      }, 'foo', (err, article) ->
        return done err if err
        article.social_title.should.containEql 'social title'
        article.social_description.should.containEql 'social description'
        article.social_image.should.containEql 'social image'
        done()

    it 'saves search metadata', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        channel_id: '5086df098523e60002000015'
        search_title: 'search title'
        search_description: 'search description'
      }, 'foo', (err, article) ->
        return done err if err
        article.search_title.should.containEql 'search title'
        article.search_description.should.containEql 'search description'
        done()

    it 'saves the seo_keyword', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        seo_keyword: 'focus'
      }, 'foo', (err, article) ->
        return done err if err
        article.seo_keyword.should.equal 'focus'
        done()

    it 'deletes article from sailthru if it is being unpublished', (done) ->
      article = {
        _id: ObjectId('5086df098523e60002000018')
        id: '5086df098523e60002000018'
        author_id: '5086df098523e60002000018'
        published: false
      }
      Article.__set__ 'onUnpublish', @onUnpublish = sinon.stub().yields(null, article)
      fabricate 'articles',
        _id: ObjectId('5086df098523e60002000018')
        id: '5086df098523e60002000018'
        author_id: ObjectId('5086df098523e60002000018')
        published: true
      , =>
        Article.save article, 'foo', (err, article) =>
          article.published.should.be.false()
          @onUnpublish.callCount.should.equal 1
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
            type: 'image'
            url: 'https://image.png'
            caption: 'Trademarked'
          }
        ]
      , ->
        Article.publishScheduledArticles (err, results) ->
          results[0].published.should.be.true()
          results[0].published_at.toString().should.equal moment('2016-01-01').toDate().toString()
          results[0].sections[0].body.should.containEql 'The start of a new article'
          results[0].sections[1].url.should.containEql 'https://image.png'
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

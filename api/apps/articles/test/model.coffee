_ = require 'underscore'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
Article = require '../model'
{ ObjectId } = require 'mongojs'
express = require 'express'
fabricateGravity = require('antigravity').fabricate
gravity = require('antigravity').server
app = require('express')()
bodyParser = require 'body-parser'

describe 'Article', ->

  before (done) ->
    app.use '/__gravity', gravity
    @server = app.listen 5000, ->
      done()

  after ->
    @server.close()

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
        err.message.should.containEql '"foo" is not allowed'
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
        { title: 'C', fair_id: ObjectId('4dc98d149a96300001003033') }
        { title: 'A', fair_id: ObjectId('4dc98d149a96300001003033')  }
        { title: 'B', fair_id: ObjectId('4dc98d149a96300001003032')  }
      ], ->
        Article.where(
          { fair_ids: ['4dc98d149a96300001003033', '4dc98d149a96300001003032'] }
          (err, { results }) ->
            _.pluck(results, 'title').sort().join('').should.equal 'ABC'
            done()
        )

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
        Article.where { all_by_author: '4d8cd73191a5c50ce220002b' }, (err, res) ->
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
        Article.where { is_super_article: true }, (err, res) ->
          { total, count, results } = res
          total.should.equal 13
          count.should.equal 1
          results[0].title.should.equal 'Hello Waaarldie'
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
        Article.where { tags: ['pickle', 'muffin'] }, (err, res) ->
          { total, count, results } = res
          total.should.equal 14
          count.should.equal 3
          results[0].title.should.equal 'Hello Weeeerld - Food'
          results[1].title.should.equal 'Hello Waaarld - Food'
          results[2].title.should.equal 'Hello Wuuuurld - Food'
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
      }, 'foo', (err, article) ->
        article.title.should.equal 'Top Ten Shows'
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
        moment(article.updated_at).format('YYYY').should.equal moment().format('YYYY')
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
      }, 'foo', (err, article) ->
        return done err if err
        article.slugs[0].should.equal 'craig-spaeth-ten-shows'
        done()

    it 'adds a slug based off a user and thumbnail title', (done) ->
      fabricate 'users', { name: 'Molly'}, (err, @user) ->
        Article.save {
          thumbnail_title: 'Foo Baz'
          author_id: @user._id
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
        }, 'foo', (err, article) =>
          return done err if err
          Article.save {
            id: article._id.toString()
            thumbnail_title: 'Foo Bar Baz'
            author_id: @user._id
            published: true
          }, 'foo', (err, article) ->
            return done err if err
            article.slugs.join('').should.equal 'molly-foo-bazmolly-foo-bar-baz'
            Article.find article.slugs[0], (err, article) ->
              article.thumbnail_title.should.equal 'Foo Bar Baz'
              done()

    it 'appends the date to an article URL when its slug already exists', (done) ->
      fabricate 'articles', {
        slugs: ['craig-spaeth-heyo']
      }, ->
        Article.save {
          thumbnail_title: 'heyo'
          author_id: '5086df098523e60002000018'
          published_at: '01-01-99'
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

    it 'denormalizes the author into the article on publish', (done) ->
      fabricate 'users', {
        _id: ObjectId('5086df098523e60002000018')
        name: 'Molly'
        profile_handle: 'molly'
      }, (err, @user) ->
        Article.save {
          title: 'Top Ten Shows'
          thumbnail_title: 'Ten Shows'
          author_id: '5086df098523e60002000018'
          published: true
        }, 'foo', (err, article) ->
          article.author.name.should.equal 'Molly'
          article.author.profile_handle.should.equal 'molly'
          done()

    it 'doesnt save a fair unless explictly set', (done) ->
      Article.save {
        title: 'Top Ten Shows'
        thumbnail_title: 'Ten Shows'
        author_id: '5086df098523e60002000018'
        fair_id: null
        published: true
      }, 'foo', (err, article) ->
        (article.fair_id?).should.not.be.ok
        done()

    it 'escapes xss', (done) ->
      body = '<h2>Hi</h2><h3>Hello</h3><p><b>Hola</b></p><p><i>Guten Tag</i></p><ol><li>Bonjour<br></li><li><a href="http://www.foo.com">Bonjour2</a></li></ol><ul><li>Aloha</li><li>Aloha Again</li></ul><h2><b><i>Good bye</i></b></h2><p><b><i>Adios</i></b></p><h3>Alfiederzen</h3><p><a href="http://foo.com">Aloha</a></p>'
      badBody = '<script>alert(foo)</script><h2>Hi</h2><h3>Hello</h3><p><b>Hola</b></p><p><i>Guten Tag</i></p><ol><li>Bonjour<br></li><li><a href="http://www.foo.com">Bonjour2</a></li></ol><ul><li>Aloha</li><li>Aloha Again</li></ul><h2><b><i>Good bye</i></b></h2><p><b><i>Adios</i></b></p><h3>Alfiederzen</h3><p><a href="http://foo.com">Aloha</a></p>'
      Article.save {
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
        ]
      }, 'foo', (err, article) ->
        article.sections[0].body.should.equal '<a href="http://foo.com">Foo</a>'
        article.sections[1].url.should.equal 'http://foo.com'
        done()

    it 'maintains the original slug when publishing with a new title', (done) ->
      fabricate 'users', { name: 'Molly'}, (err, @user) ->
        Article.save {
          thumbnail_title: 'Foo Baz'
          author_id: @user._id
          published: true
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
        fair_id: '5530e72f7261696238050000'
        partner_ids: ['4f5228a1de92d1000100076e']
        tags: ['cool', 'art']
        published: true
      }, 'foo', (err, article) ->
        return done err if err
        article.keywords.join(',').should.equal 'Pablo Picasso,Pablo Picasso,Armory Show 2013,Gagosian Gallery,cool,art'
        done()

    it 'saves Super Articles', (done) ->
      Article.save {
        author_id: '5086df098523e60002000018'
        is_super_article: true
        super_article: {
          partner_link: 'http://partnerlink.com'
          partner_logo: 'http://partnerlink.com/logo.jpg'
          secondary_partner_logo: 'http://secondarypartner.com/logo.png'
          related_articles: [ '5530e72f7261696238050000' ]
        }
        published: true
      }, 'foo', (err, article) ->
        return done err if err
        article.super_article.partner_link.should.equal 'http://partnerlink.com'
        article.super_article.partner_logo.should.equal 'http://partnerlink.com/logo.jpg'
        article.super_article.related_articles.length.should.equal 1
        article.is_super_article.should.equal true
        article.super_article.secondary_partner_logo.should.equal 'http://secondarypartner.com/logo.png'
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

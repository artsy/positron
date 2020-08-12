/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore');
const sinon = require('sinon');
const { db, fabricate, empty, fixtures } = require('../../../../../test/helpers/db');
const gravity = require('@artsy/antigravity').server;
const express = require('express');
const app = require('express')();
const Article = require('../../../model/index.js');
const search = require('../../../../../lib/elasticsearch');
const { ObjectId } = require('mongojs');
const moment = require('moment');

describe('Article', function() {

  before(function(done) {
    app.use('/__gravity', gravity);
    return this.server = app.listen(5000, () => search.client.indices.create(
      {index: 'articles_' + process.env.NODE_ENV}
    , () => done()));
  });

  after(function() {
    this.server.close();
    return search.client.indices.delete({
      index: 'articles_' + process.env.NODE_ENV});
  });

  beforeEach(done => // @deleteArticleFromSailthru = sinon.stub().yields()
  // Article.__set__ 'deleteArticleFromSailthru', @deleteArticleFromSailthru

  empty(() => fabricate('articles', _.times(10, () => ({})), () => done())));

  describe('#publishScheduledArticles', () => it('calls #save on each article that needs to be published', done => fabricate('articles', {
    _id: ObjectId('54276766fd4f50996aeca2b8'),
    author_id: ObjectId('5086df098523e60002000018'),
    published: false,
    scheduled_publish_at: moment('2016-01-01').toDate(),
    author: {
      name: 'Kana Abe'
    },
    sections: [
      {
        type: 'text',
        body: 'The start of a new article'
      },
      {
        type: 'image_collection',
        layout: 'overflow_fillwidth',
        images: [{
          url: 'https://image.png',
          caption: 'Trademarked'
        }
        ]
      }
    ]
  }
  , () => Article.publishScheduledArticles(function(err, results) {
    results[0].published.should.be.true();
    results[0].published_at.toString().should.equal(moment('2016-01-01').toDate().toString());
    results[0].sections[0].body.should.containEql('The start of a new article');
    results[0].sections[1].images[0].url.should.containEql('https://image.png');
    return done();
  }))));

  describe('#unqueue', () => it('calls #save on each article that needs to be unqueued', done => fabricate('articles', {
    _id: ObjectId('54276766fd4f50996aeca2b8'),
    weekly_email: true,
    daily_email: true,
    author: {
      name: 'Kana Abe'
    },
    sections: []
  }
  , () => Article.unqueue(function(err, results) {
    results[0].weekly_email.should.be.false();
    results[0].daily_email.should.be.false();
    return done();
  }))));

  describe("#destroy", function() {

    it('removes an article', done => fabricate('articles', { _id: ObjectId('5086df098523e60002000018') }, () => Article.destroy('5086df098523e60002000018', err => db.articles.count(function(err, count) {
      count.should.equal(10);
      return done();
    }))));

    it('returns an error message', done => Article.destroy('5086df098523e60002000019', function(err) {
      err.message.should.equal('Article not found.');
      return done();
    }));

    // it 'removes the article from sailthru', (done) ->
    //   fabricate 'articles', {
    //     _id: ObjectId('5086df098523e60002000018')
    //     layout: 'video'
    //     slugs: ['article-slug']
    //   }, =>
    //     Article.destroy '5086df098523e60002000018', (err) =>
    //       @deleteArticleFromSailthru.args[0][0].should.containEql '/video/article-slug'
    //       done()

    return it('removes the article from elasticsearch', done => fabricate('articles', { _id: ObjectId('5086df098523e60002000019'), title: 'quux' }, () => setTimeout( () => Article.destroy('5086df098523e60002000019', err => setTimeout( () => search.client.search({
      index: search.index,
      q: 'title:quux'
    }
    , function(error, response) {
      response.hits.hits.length.should.equal(0);
      return done();
    })
    , 1000))
    , 1000)));
  });

  describe('#present', function() {

    it('adds both _id and id', function() {
      const result = Article.present(_.extend({}, fixtures().articles, {_id: 'foo'}));
      result.id.should.equal('foo');
      return result._id.should.equal('foo');
    });

    return it('converts dates to ISO strings', function() {
      const result = Article.present(_.extend({}, fixtures().articles, {published_at: new Date, scheduled_publish_at: new Date}));
      moment(result.updated_at).toISOString().should.equal(result.updated_at);
      moment(result.published_at).toISOString().should.equal(result.published_at);
      return moment(result.scheduled_publish_at).toISOString().should.equal(result.scheduled_publish_at);
    });
  });

  describe('#presentCollection', () => it('shows a total/count/results hash for arrays of articles', function() {
    const result = Article.presentCollection({
      total: 10,
      count: 1,
      results: [_.extend({}, fixtures().articles, {_id: 'baz'})]});
    return result.results[0].id.should.equal('baz');
  }));

  describe('#getSuperArticleCount', function() {
    it('returns 0 if the id is invalid', function() {
      const id = '123';
      return Article.getSuperArticleCount(id)
      .then(count => count.should.equal(0));
    });

    return it('returns a count of super articles that have the given id as a related article', () => fabricate('articles', {
      _id: ObjectId('54276766fd4f50996aeca2b8'),
      super_article: {
        related_articles: [ObjectId('5086df098523e60002000018')]
      }
    }
    , function() {
      const id = '5086df098523e60002000018';
      return Article.getSuperArticleCount(id)
      .then(count => count.should.equal(1));
    }));
  });

  return describe('#promisedMongoFetch', () => it('returns results, counts, and totals', () => fabricate('articles', { _id: ObjectId('5086df098523e60002000018') }, () => Article.promisedMongoFetch({ count: true, ids: [ObjectId('5086df098523e60002000018')] })
  .then(function({ count, total, results }) {
    count.should.equal(1);
    total.should.equal(11);
    return results.length.should.equal(1);
  }))));
});


/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore');
const { db, fixtures, fabricate, empty } = require('../../../test/helpers/db');
const app = require('../../../');
const request = require('superagent');
const { ObjectId } = require('mongojs');

describe('articles endpoints', function() {

  beforeEach(function(done) {
    return empty(() => {
      this.token = fixtures().users.access_token;
      return fabricate('users', {}, (err, user) => {
        this.user = user;
        return this.server = app.listen(5000, () => done());
      });
    });
  });

  afterEach(function() {
    return this.server.close();
  });

  describe('as a non-logged in user', () => it('can get a list of published articles without a logged in user', done => fabricate('articles', [
    { title: 'Flowers on Flowers', published: true },
    { title: 'Flowers on Flowers The Sequel', published: true },
    { published: false }
  ], function(err, articles) {
    request
      .get("http://localhost:5000/articles?count=true")
      .end(function(err, res) {
        res.body.total.should.equal(3);
        res.body.count.should.equal(2);
        res.body.results[0].title.should.equal('Flowers on Flowers The Sequel');
        return done();
    });
  })));

  describe('as a non-admin', function() {

    beforeEach(function(done) {
      this.normieToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsInR5cGUiOiJVc2VyIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwidHlwZSI6IlVzZXIiLCJwYXJ0bmVyX2lkcyI6W10sImlhdCI6MTUxNjIzOTAyMn0.1ONei7j20cbeusjWiUvTt-CTDCdpewnj3mbmIA_-Hbs';
      return fabricate('users', {
        type: 'User',
        name: 'Normie',
        access_token: this.normieToken,
        has_partner_access: false,
        _id: undefined
      }, (err, normie) => {
        this.normie = normie;
        return done();
      });
    });

    it('does not allow featuring', function(done) {
      request
        .post("http://localhost:5000/articles")
        .set({'X-Access-Token': this.normieToken})
        .send({featured: true}).end(function(err, res) {
          err.status.should.equal(401);
          res.body.message.should.containEql('must be an admin');
          return done();
      });
    });

    return xit('does not allow viewing drafts', done => fabricate('articles', [
      {
        title: 'Cows on the prarie',
        _id: ObjectId('5086df098523e60002000012'),
        partner_channel_id: ObjectId('5086df098523e60002000012'),
        published: false
      }
    ], function(err, articles) {
      request
        .get("http://localhost:5000/articles/5086df098523e60002000012")
        .end(function(err, res) {
          err.status.should.equal(404);
          return done();
      });
    }));
  });

  return describe('as a channel member', function() {

    it('creates articles', function(done) {
      request
        .post("http://localhost:5000/articles")
        .set({'X-Access-Token': this.token})
        .send({
          title: 'Hi',
          partner_channel_id: '5086df098523e60002000012',
          author_id: '5086df098523e60002000012'
        }).end(function(err, res) {
          res.body.title.should.equal('Hi');
          return done();
      });
    });

    it('gets a list of articles by author', function(done) {
      return fabricate('articles', [
        { title: 'Flowers on Flowers', author_id: this.user._id },
        { title: 'Flowers on Flowers The Sequel', author_id: this.user._id },
        {}
      ], (err, articles) => {
        request
          .get(`http://localhost:5000/articles?author_id=${this.user._id}&published=true&count=true`)
          .set({'X-Access-Token': this.token})
          .end(function(err, res) {
            res.body.total.should.equal(3);
            res.body.count.should.equal(2);
            res.body.results[0].title.should.equal('Flowers on Flowers The Sequel');
            return done();
        });
      });
    });

    it('gets a list of articles by channel', function(done) {
      return fabricate('articles', [
        {
          title: 'Winter Is Coming',
          channel_id: ObjectId('5086df098523e60002000012'),
          published: true
        }
      ], (err, articles) => {
        request
          .get("http://localhost:5000/articles?channel_id=5086df098523e60002000012&published=true&count=true")
          .set({'X-Access-Token': this.token})
          .end(function(err, res) {
            res.body.total.should.equal(1);
            res.body.count.should.equal(1);
            res.body.results[0].title.should.equal('Winter Is Coming');
            return done();
        });
      });
    });

    it('denies unpublished requests', done => fabricate('articles', [
      { title: 'Flowers on Flowers', published: true },
      { title: 'Flowers on Flowers The Sequel', published: true },
      { published: false }
    ], function(err, articles) {
      request
        .get("http://localhost:5000/articles?published=false")
        .end(function(err, res) {
          res.body.message.should.containEql('published=true');
          return done();
      });
    }));

    it('gets a single article', function(done) {
      return fabricate('articles', [
        {
          title: 'Cows on the prarie',
          _id: ObjectId('5086df098523e60002000012'),
          sections: [{
            type: "text",
            body: "Cows on the lawn"
          }],
          published: true
        }
      ], (err, articles) => {
        request
          .get("http://localhost:5000/articles/5086df098523e60002000012")
          .set({'X-Access-Token': this.token})
          .end(function(err, res) {
            res.body.sections[0].type.should.equal('text');
            res.body.sections[0].body.should.equal('Cows on the lawn');
            res.body.title.should.equal('Cows on the prarie');
            return done();
        });
      });
    });

    it('gets a single article of a draft', function(done) {
      return fabricate('articles', [
        {
          title: 'Cows on the prarie',
          _id: ObjectId('5086df098523e60002000012'),
          partner_channel_id: ObjectId('5086df098523e60002000012'),
          published: false
        }
      ], (err, articles) => {
        request
          .get("http://localhost:5000/articles/5086df098523e60002000012")
          .set({'X-Access-Token': this.token})
          .end(function(err, res) {
            res.body.title.should.equal('Cows on the prarie');
            return done();
        });
      });
    });

    it('updates an article', function(done) {
      return fabricate('articles', [
        { title: 'Flowers on Flowers' },
        {
          title: 'Cows on the prarie',
          _id: ObjectId('5086df098523e60002000012'),
          partner_channel_id: ObjectId('5086df098523e60002000012')
        }
      ], (err, articles) => {
        request
          .put("http://localhost:5000/articles/5086df098523e60002000012")
          .send({
            title: 'Hellow Wrld',
            author_id: '5086df098523e60002000012',
            channel_id: '5086df098523e60002000013'
          }).set({'X-Access-Token': this.token})
          .end(function(err, res) {
            res.body.title.should.equal('Hellow Wrld');
            return done();
        });
      });
    });

    return it('deletes an article', function(done) {
      return fabricate('articles', [
        { title: 'Flowers on Flowers' },
        {
          title: 'Cows on the prarie',
          _id: ObjectId('5086df098523e60002000012'),
          partner_channel_id: ObjectId('5086df098523e60002000012')
        }
      ], (err, articles) => {
        request
          .del("http://localhost:5000/articles/5086df098523e60002000012")
          .set({'X-Access-Token': this.token})
          .end((err, res) => db.articles.count(function(err, count) {
          count.should.equal(1);
          return done();
        }));
      });
    });
  });
});

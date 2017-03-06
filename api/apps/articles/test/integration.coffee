_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'
artsyXapp = require 'artsy-xapp'

describe 'articles endpoints', ->

  beforeEach (done) ->
    artsyXapp.token = ''
    empty =>
      fabricate 'users', {}, (err, @user) =>
        @server = app.listen 5000, ->
          done()

  afterEach ->
    @server.close()

  describe 'as a non-logged in user', ->

    it 'can get a list of published articles without a logged in user', (done) ->
      fabricate 'articles', [
        { title: 'Flowers on Flowers', published: true }
        { title: 'Flowers on Flowers The Sequel', published: true }
        { published: false }
      ], (err, articles) =>
        request
          .get("http://localhost:5000/articles?published=true&count=true")
          .end (err, res) ->
              res.body.total.should.equal 3
              res.body.count.should.equal 2
              res.body.results[0].title.should.equal 'Flowers on Flowers The Sequel'
              done()

  describe 'as a non-admin', ->

    beforeEach (done) ->
      fabricate 'users', {
        type: 'User'
        name: 'Normie'
        access_token: 'foobar'
        has_partner_access: false
        _id: undefined
      }, (err, @normie) =>
        done()

    it 'does not allow featuring', (done) ->
      request
        .post("http://localhost:5000/articles")
        .set('X-Access-Token': 'foobar')
        .send(featured: true).end (err, res) ->
          err.status.should.equal 401
          res.body.message.should.containEql 'must be an admin'
          done()
      return

  describe 'as a channel member', ->

    it 'creates articles', (done) ->
      request
        .post("http://localhost:5000/articles")
        .set('X-Access-Token': @user.access_token)
        .send(title: 'Hi', partner_channel_id: ObjectId('5086df098523e60002000012')).end (err, res) ->
          res.body.title.should.equal 'Hi'
          done()
      return

    it 'gets a list of articles by author', (done) ->
      fabricate 'articles', [
        { title: 'Flowers on Flowers', author_id: @user._id }
        { title: 'Flowers on Flowers The Sequel', author_id: @user._id }
        {}
      ], (err, articles) =>
        request
          .get("http://localhost:5000/articles?author_id=#{@user._id}&published=true&count=true")
          .set('X-Access-Token': @user.access_token)
          .end (err, res) ->
            res.body.total.should.equal 3
            res.body.count.should.equal 2
            res.body.results[0].title.should.equal 'Flowers on Flowers The Sequel'
            done()

    it 'gets a list of articles by channel', (done) ->
      fabricate 'articles', [
        { title: 'Winter Is Coming', channel_id: ObjectId('5086df098523e60002000012'), published: true }
      ], (err, articles) =>
        request
        .get("http://localhost:5000/articles?channel_id=5086df098523e60002000012&published=true&count=true")
        .set('X-Access-Token': @user.access_token)
        .end (err, res) ->
          res.body.total.should.equal 1
          res.body.count.should.equal 1
          res.body.results[0].title.should.equal 'Winter Is Coming'
          done()

    it 'denies unpublished requests', (done) ->
      fabricate 'articles', [
        { title: 'Flowers on Flowers', published: true }
        { title: 'Flowers on Flowers The Sequel', published: true }
        { published: false }
      ], (err, articles) =>
        request
          .get("http://localhost:5000/articles?published=false")
        .end (err, res) ->
          res.body.message.should.containEql 'published=true'
          done()

    it 'gets a single article', (done) ->
      fabricate 'articles', [
        {
          title: 'Cows on the prarie'
          _id: ObjectId('5086df098523e60002000012')
          published: true
        }
      ], (err, articles) =>
        request
          .get("http://localhost:5000/articles/5086df098523e60002000012")
          .set('X-Access-Token': @user.access_token)
          .end (err, res) ->
            res.body.title.should.equal 'Cows on the prarie'
            done()

    it 'gets a single article of a draft', (done) ->
      fabricate 'articles', [
        {
          title: 'Cows on the prarie'
          _id: ObjectId('5086df098523e60002000012')
          partner_channel_id: ObjectId('5086df098523e60002000012')
          published: false
        }
      ], (err, articles) =>
        request
          .get("http://localhost:5000/articles/5086df098523e60002000012")
          .set('X-Access-Token': @user.access_token)
          .end (err, res) ->
            res.body.title.should.equal 'Cows on the prarie'
            done()

    it 'updates an article', (done) ->
      fabricate 'articles', [
        { title: 'Flowers on Flowers' }
        {
          title: 'Cows on the prarie'
          _id: ObjectId('5086df098523e60002000012')
          partner_channel_id: '5086df098523e60002000012'
        }
      ], (err, articles) =>
        request
          .put("http://localhost:5000/articles/5086df098523e60002000012")
          .send(title: 'Hellow Wrld')
          .set('X-Access-Token': @user.access_token)
          .end (err, res) ->
            res.body.title.should.equal 'Hellow Wrld'
            done()

    it 'deletes an article', (done) ->
      fabricate 'articles', [
        { title: 'Flowers on Flowers' }
        {
          title: 'Cows on the prarie'
          _id: ObjectId('5086df098523e60002000012')
          partner_channel_id: '5086df098523e60002000012'
        }
      ], (err, articles) =>
        request
          .del("http://localhost:5000/articles/5086df098523e60002000012")
          .set('X-Access-Token': @user.access_token)
          .end (err, res) ->
            db.articles.count (err, count) ->
              count.should.equal 1
              done()

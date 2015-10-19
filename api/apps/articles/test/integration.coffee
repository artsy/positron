_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'

describe 'articles endpoints', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {}, (err, @user) =>
        @server = app.listen 5000, ->
          done()

  afterEach ->
    @server.close()

  describe 'as a non-admin', ->

    beforeEach (done) ->
      fabricate 'users', {
        type: 'User'
        name: 'Normie'
        access_token: 'foobar'
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

  it 'creates articles', (done) ->
    request
      .post("http://localhost:5000/articles")
      .set('X-Access-Token': @user.access_token)
      .send(title: 'Hi', author_id: @user._id).end (err, res) ->
        res.body.title.should.equal 'Hi'
        done()

  it 'gets a list of articles by author', (done) ->
    fabricate 'articles', [
      { title: 'Flowers on Flowers', author_id: @user._id }
      { title: 'Flowers on Flowers The Sequel', author_id: @user._id }
      {}
    ], (err, articles) =>
      request
        .get("http://localhost:5000/articles?author_id=#{@user._id}&published=true")
        .set('X-Access-Token': @user.access_token)
        .end (err, res) ->
          res.body.total.should.equal 3
          res.body.count.should.equal 2
          res.body.results[0].title.should.equal 'Flowers on Flowers The Sequel'
          done()

  it 'can get a list of published articles without a logged in user', (done) ->
    fabricate 'articles', [
      { title: 'Flowers on Flowers', published: true }
      { title: 'Flowers on Flowers The Sequel', published: true }
      { published: false }
    ], (err, articles) =>
      request
        .get("http://localhost:5000/articles?published=true")
      .end (err, res) ->
          res.body.total.should.equal 3
          res.body.count.should.equal 2
          res.body.results[0].title.should.equal 'Flowers on Flowers The Sequel'
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
        author_id: @user._id
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
        author_id: @user._id
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
        author_id: @user._id
      }
    ], (err, articles) =>
      request
        .del("http://localhost:5000/articles/5086df098523e60002000012")
        .set('X-Access-Token': @user.access_token)
        .end (err, res) ->
          db.articles.count (err, count) ->
            count.should.equal 1
            done()

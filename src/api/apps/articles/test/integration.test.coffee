_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'

describe 'articles endpoints', ->

  beforeEach (done) ->
    empty =>
      @token = fixtures().users.access_token
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
      ], (err, articles) ->
        request
          .get("http://localhost:5000/articles?count=true")
          .end (err, res) ->
            res.body.total.should.equal 3
            res.body.count.should.equal 2
            res.body.results[0].title.should.equal 'Flowers on Flowers The Sequel'
            done()
        return

  describe 'as a non-admin', ->

    beforeEach (done) ->
      @normieToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsInR5cGUiOiJVc2VyIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwidHlwZSI6IlVzZXIiLCJyb2xlcyI6IiIsInBhcnRuZXJfaWRzIjpbXSwiaWF0IjoxNTE2MjM5MDIyfQ.uMBdEvBEVprixHImgNn2wed4WMi_G2E1aZ2Rj4xfSG0'
      fabricate 'users', {
        roles: [],
        name: 'Normie'
        access_token: @normieToken
        has_partner_access: false
        _id: undefined
      }, (err, @normie) =>
        done()

    it 'does not allow featuring', (done) ->
      request
        .post("http://localhost:5000/articles")
        .set('X-Access-Token': @normieToken)
        .send(featured: true).end (err, res) ->
          err.status.should.equal 401
          res.body.message.should.containEql 'must be an admin'
          done()
      return

    xit 'does not allow viewing drafts', (done) ->
      fabricate 'articles', [
        {
          title: 'Cows on the prarie'
          _id: ObjectId '5086df098523e60002000012'
          partner_channel_id: ObjectId '5086df098523e60002000012'
          published: false
        }
      ], (err, articles) ->
        request
          .get("http://localhost:5000/articles/5086df098523e60002000012")
          .end (err, res) ->
            err.status.should.equal 404
            done()
        return

  describe 'as a channel member', ->

    it 'creates articles', (done) ->
      request
        .post("http://localhost:5000/articles")
        .set('X-Access-Token': @token)
        .send(
          title: 'Hi'
          partner_channel_id: '5086df098523e60002000012'
          author_id: '5086df098523e60002000012'
        ).end (err, res) ->
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
          .set('X-Access-Token': @token)
          .end (err, res) ->
            res.body.total.should.equal 3
            res.body.count.should.equal 2
            res.body.results[0].title.should.equal 'Flowers on Flowers The Sequel'
            done()
        return

    it 'gets a list of articles by channel', (done) ->
      fabricate 'articles', [
        {
          title: 'Winter Is Coming'
          channel_id: ObjectId '5086df098523e60002000012'
          published: true
        }
      ], (err, articles) =>
        request
          .get("http://localhost:5000/articles?channel_id=5086df098523e60002000012&published=true&count=true")
          .set('X-Access-Token': @token)
          .end (err, res) ->
            res.body.total.should.equal 1
            res.body.count.should.equal 1
            res.body.results[0].title.should.equal 'Winter Is Coming'
            done()
        return

    it 'denies unpublished requests', (done) ->
      fabricate 'articles', [
        { title: 'Flowers on Flowers', published: true }
        { title: 'Flowers on Flowers The Sequel', published: true }
        { published: false }
      ], (err, articles) ->
        request
          .get("http://localhost:5000/articles?published=false")
          .end (err, res) ->
            res.body.message.should.containEql 'published=true'
            done()
        return

    it 'gets a single article', (done) ->
      fabricate 'articles', [
        {
          title: 'Cows on the prarie'
          _id: ObjectId '5086df098523e60002000012'
          sections: [{
            type: "text",
            body: "Cows on the lawn"
          }]
          published: true
        }
      ], (err, articles) =>
        request
          .get("http://localhost:5000/articles/5086df098523e60002000012")
          .set('X-Access-Token': @token)
          .end (err, res) ->
            res.body.sections[0].type.should.equal 'text'
            res.body.sections[0].body.should.equal 'Cows on the lawn'
            res.body.title.should.equal 'Cows on the prarie'
            done()
        return

    it 'gets a single article of a draft', (done) ->
      fabricate 'articles', [
        {
          title: 'Cows on the prarie'
          _id: ObjectId '5086df098523e60002000012'
          partner_channel_id: ObjectId '5086df098523e60002000012'
          published: false
        }
      ], (err, articles) =>
        request
          .get("http://localhost:5000/articles/5086df098523e60002000012")
          .set('X-Access-Token': @token)
          .end (err, res) ->
            res.body.title.should.equal 'Cows on the prarie'
            done()
        return

    it 'updates an article', (done) ->
      fabricate 'articles', [
        { title: 'Flowers on Flowers' }
        {
          title: 'Cows on the prarie'
          _id: ObjectId '5086df098523e60002000012'
          partner_channel_id: ObjectId '5086df098523e60002000012'
        }
      ], (err, articles) =>
        request
          .put("http://localhost:5000/articles/5086df098523e60002000012")
          .send({
            title: 'Hellow Wrld'
            author_id: '5086df098523e60002000012'
            channel_id: '5086df098523e60002000013'
          }).set('X-Access-Token': @token)
          .end (err, res) ->
            res.body.title.should.equal 'Hellow Wrld'
            done()
        return

    it 'deletes an article', (done) ->
      fabricate 'articles', [
        { title: 'Flowers on Flowers' }
        {
          title: 'Cows on the prarie'
          _id: ObjectId '5086df098523e60002000012'
          partner_channel_id: ObjectId '5086df098523e60002000012'
        }
      ], (err, articles) =>
        request
          .del("http://localhost:5000/articles/5086df098523e60002000012")
          .set('X-Access-Token': @token)
          .end (err, res) ->
            db.articles.count (err, count) ->
              count.should.equal 1
              done()
        return

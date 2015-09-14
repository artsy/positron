_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'

describe 'sections endpoints', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {}, (err, @user) =>
        @server = app.listen 5000, ->
          console.log 'listening'
          done()

  afterEach ->
    @server.close()

  it 'gets a list of sections by query', (done) ->
    fabricate 'sections', [
      { title: 'Miami Basel' }
      { title: 'Foobar' }
      {}
    ], (err, sections) =>
      request
        .get("http://localhost:5000/sections?q=Miami Basel")
        .end (err, res) ->
          res.body.total.should.equal 3
          res.body.count.should.equal 1
          res.body.results[0].title.should.equal 'Miami Basel'
          done()

  it 'gets a single section', (done) ->
    fabricate 'sections', [
      {
        _id: ObjectId('55356a9deca560a0137aa4b7')
        title: 'Cat Season in the Art World'
      }
    ], (err, sections) =>
      request
        .get("http://localhost:5000/sections/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          res.body.title.should.equal 'Cat Season in the Art World'
          done()

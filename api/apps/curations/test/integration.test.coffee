_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'

describe 'curations endpoints', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {}, (err, @user) =>
        @server = app.listen 5000, ->
          done()

  afterEach ->
    @server.close()

  it 'gets a single curation by id', (done) ->
    fabricate 'curations', [
      { name: 'Homepage', _id: ObjectId('55356a9deca560a0137aa4b7') }
      { name: 'Email Signups' }
    ], (err, curation) =>
      request
        .get("http://localhost:5000/curations/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          res.body.name.should.equal 'Homepage'
          done()

  it 'gets a list of curations', (done) ->
    fabricate 'curations', [
      { name: 'Homepage' }
      { name: 'Email Signups' }
      { name: 'Artist Page' }
      { name: 'About Page' }
    ], (err, curations) =>
      request
        .get("http://localhost:5000/curations")
        .end (err, res) ->
          res.body.total.should.equal 4
          res.body.count.should.equal 4
          res.body.results[3].name.should.equal 'Homepage'
          res.body.results[2].name.should.equal 'Email Signups'
          res.body.results[1].name.should.equal 'Artist Page'
          res.body.results[0].name.should.equal 'About Page'
          done()

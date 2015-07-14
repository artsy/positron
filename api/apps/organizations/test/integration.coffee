_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'

describe 'organizations endpoints', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {}, (err, @user) =>
        @server = app.listen 5000, ->
          console.log 'listening'
          done()

  afterEach ->
    @server.close()

  it 'gets a list of organizations', (done) ->
    fabricate 'organizations', [
      { name: 'Artsy Editorial' }
      { name: 'The Art Genome Project' }
    ], (err, organizations) =>
      request
        .get("http://localhost:5000/organizations")
        .end (err, res) ->
          res.body.total.should.equal 2
          res.body.count.should.equal 2
          res.body.results[0].name.should.equal 'The Art Genome Project'
          done()

  it 'gets a single organization', (done) ->
    fabricate 'organizations', [
      {
        _id: ObjectId('55356a9deca560a0137aa4b7')
        name: 'Editorial'
      }
    ], (err, organizations) =>
      request
        .get("http://localhost:5000/organizations/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          res.body.name.should.equal 'Editorial'
          done()

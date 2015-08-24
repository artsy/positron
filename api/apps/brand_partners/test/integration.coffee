_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
request = require 'superagent'
{ ObjectId } = require 'mongojs'

describe 'brandPartners endpoints', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {}, (err, @user) =>
        @server = app.listen 5000, ->
          console.log 'listening'
          done()

  afterEach ->
    @server.close()

  it 'gets a single brand partner', (done) ->
    fabricate 'brand_partners', [
      {
        _id: ObjectId('55356a9deca560a0137aa4b7')
        slug: 'VersaceVersace'
      }
    ], (err, brandPartners) =>
      request
        .get("http://localhost:5000/brand_partners/55356a9deca560a0137aa4b7")
        .end (err, res) ->
          res.body.slug.should.equal 'VersaceVersace'
          done()

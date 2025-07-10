require '../../../test/helpers/db'
_ = require 'underscore'
app = require '../../../'
request = require 'superagent'

describe 'shows endpoints', ->

  beforeEach (done) ->
    @server = app.listen 5001, ->
      done()

  afterEach ->
    @server.close()

  it 'returns a show by id', (done) ->
    request
      .get("http://localhost:5001/show/foo")
      .set('X-Access-Token': 'foo-token')
      .end (err, res) ->
        res.body.name.should.equal 'Inez & Vinoodh'
        done()
    return

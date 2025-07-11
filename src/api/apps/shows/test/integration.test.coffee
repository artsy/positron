require '../../../test/helpers/db'
{ getAvailablePort } = require '../../../test/helpers/port'
_ = require 'underscore'
app = require '../../../'
request = require 'superagent'

describe 'shows endpoints', ->

  port = null
  server = null

  beforeEach (done) ->
    getAvailablePort (portErr, p) ->
      return done(portErr) if portErr
      port = p
      server = app.listen port, ->
        done()

  afterEach ->
    server.close()

  it 'returns a show by id', (done) ->
    request
      .get("http://localhost:#{port}/show/foo")
      .set('X-Access-Token': 'foo-token')
      .end (err, res) ->
        return done(err) if err
        res.body.name.should.equal 'Inez & Vinoodh'
        done()
    return

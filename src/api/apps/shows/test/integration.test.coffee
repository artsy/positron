require '../../../test/helpers/db'
_ = require 'underscore'
# Pinned to port 5000: the shows model self-calls antigravity at ARTSY_URL
# (http://localhost:5000/__gravity), captured at module load.
{ startServer, closeServer, url } = require '../../../test/helpers/server'
request = require 'superagent'

describe 'shows endpoints', ->

  beforeEach (done) ->
    startServer 5000, done

  afterEach (done) ->
    closeServer done

  it 'returns a show by id', (done) ->
    request
      .get(url("/show/foo"))
      .set('X-Access-Token': 'foo-token')
      .end (err, res) ->
        res.body.name.should.equal 'Inez & Vinoodh'
        done()
    return

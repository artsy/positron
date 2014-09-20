rewire = require 'rewire'
Backbone = require 'backbone'
spooky = rewire '../../lib/spooky_fetcher'
integration = require "../helpers/integration"

describe 'spooky fetch', ->

  before (done) ->
    spooky.__set__ 'sd',
      SPOOKY_URL: 'http://localhost:5000/__api'
      SPOOKY_TOKEN: 'token'
    integration.startServer -> done()

  after ->
    integration.closeServer()

  it 'crawls links and creates models from the API data like a BOSS', (done) ->
    spooky.new Backbone.Collection, 'articles.articles', (err, articles) ->
      articles.first().get('title').should.equal 'The art in Copenhagen is soo over'
      done()